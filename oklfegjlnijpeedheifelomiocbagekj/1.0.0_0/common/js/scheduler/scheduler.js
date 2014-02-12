(function() {
	BaseModel = Backbone.Model.extend({
		defaults: {
			timestamp: new Date().getTime()
		},
		initialize: function () {
			this.bind("error", function (model, error) {
				console.error(error);
				
				var e = Error(error);
				_.each(Scheduler.errorHandlers, function(errorHandler) {
					errorHandler(e);
				});
			});
			this.bind("remove", function () {
				this.destroy();
			});
			this.bind("change", function() {
				this.save();
			});
		},
		validate: function(attrs) {
			var invalid = [];
			if (!validateId(attrs.id)) {
				invalid.push("id: " + attrs.id);
			}
			if (!validateTimestamp(attrs.timestamp)) {
				invalid.push("timestamp: " + attrs.timestamp);
			}
			return invalid;
		},
		isStringFunction: function(strFunc) {
			return _.isString(strFunc) && strFunc.substring(0,8) == 'function';
		},
		numParamsInStringFunction: function(strFunc) {
			var definition = strFunc.substring(9);
			var openParamsIndex = definition.indexOf("(");
			if (openParamsIndex < 0) {
				return false;
			}
			var closeParamsIndex = definition.indexOf(")");
			if (closeParamsIndex < 0) {
				return false;
			}
			return definition.substring(openParamsIndex + 1, closeParamsIndex).split(",").length;
		}
	});
	var validateId = function(id) {
		return _.isString(id) && !_.isEmpty(id);
	};
	var validateTimestamp = function(timestamp) {
		return _.isNumber(timestamp);
	}
})();

var BaseList = Backbone.Collection.extend({
	eval: function() {
		this.each(function(model) {
			model.eval();
		});
	}
});

(function() {
	TriggerType = BaseModel.extend({
		defaults: _.extend({
			onAddJob: function(job) {},
			onRemoveJob: function(job) {},
			isJobTriggered: function(job, params) {
				return false;
			},
			fire: function(job, params) {
				job.get("jobCode")(job.get("metadata"), params);
			},
			noFire: function(job, params) {}
		}, BaseModel.prototype.defaults),
		validate: function(attrs) {
			var invalid = BaseModel.prototype.validate.call(this, attrs);
			if (!validateFunction(attrs.onAddJob, this.defaults.onAddJob)) {
				invalid.push("onAddJob: " + attrs.onAddJob);
			}
			if (!validateFunction(attrs.onRemoveJob, this.defaults.onRemoveJob)) {
				invalid.push("onRemoveJob: " + attrs.onRemoveJob);
			}
			if (!validateFunction(attrs.isJobTriggered, this.defaults.isJobTriggered)) {
				invalid.push("isJobTriggered: " + attrs.isJobTriggered);
			}
			if (!validateFunction(attrs.fire, this.defaults.fire)) {
				invalid.push("fire: " + attrs.fire);
			}
			if (!validateFunction(attrs.noFire, this.defaults.noFire)) {
				invalid.push("noFire: " + attrs.noFire);
			}
			var unknownAttrs = _.without(_.keys(attrs), 'id', 'timestamp', 'onAddJob', 'onRemoveJob', 'isJobTriggered', 'fire', 'noFire');
			if (!_.isEmpty(unknownAttrs)) {
				invalid.push("unknownAttrs: " + unknownAttrs);
			}
			return invalid.length > 0 ? "Invalid attribute(s) - " + invalid : null;
		},
		eval: function() {
			var _this = this;
			var evaluatedFunctions = {};
			_.each(['onAddJob', 'onRemoveJob', 'isJobTriggered', 'fire', 'noFire'], function(func) {
				evaluatedFunctions[func] = JSONfn.eval(_this.get(func));
			});
			this.set(evaluatedFunctions);
		},
		execute: function(functionToExecute, job, params) {
			return this.get(functionToExecute)(job, params);
		}
	});
	var validateFunction = function(func, defaultFunction) {
		return _.isFunction(func) && func.length == defaultFunction.length;
	};
})();

var TriggerTypeList = BaseList.extend({
	model: TriggerType,
	fetch: function(options) {
		var returnVal = Backbone.Collection.prototype.fetch.call(this, options);
		if (options && options.evaluate) {
			this.eval();
		}
		return returnVal;
	},
	remove: function(triggerType) {
		if (!_.isUndefined(triggerType)) {
			Jobs.clear(triggerType);
		}
		return Backbone.Collection.prototype.remove.call(this, triggerType);
	},
	clear: function() {
		var triggerTypesToRemove = this.filter(function(triggerType) {
			return true;
		});
		var _this = this;
		_.each(triggerTypesToRemove, function(triggerType) {
			_this.remove(triggerType.id);
		});
	}
});

(function() {
	Job = BaseModel.extend({
		defaults: function() {
			return _.extend({
				metadata: {},
				order: Jobs.nextOrder()
			}, BaseModel.prototype.defaults);
		},
		validate: function(attrs) {
			var invalid = BaseModel.prototype.validate.call(this, attrs);
			if (!validateTriggerType(attrs.triggerType, this.get("triggerType"))) {
				invalid.push("triggerType: " + attrs.triggerType);
			}
			if (!validateTrigger(attrs.trigger)) {
				invalid.push("trigger: " + attrs.trigger);
			}
			if (!validateJobCode(attrs.jobCode)) {
				invalid.push("jobCode: " + attrs.jobCode);
			}
			var unknownAttrs = _.without(_.keys(attrs), 'id', 'timestamp', 'triggerType', 'trigger', 'jobCode', 'metadata', 'order');
			if (!_.isEmpty(unknownAttrs)) {
				invalid.push("unknownAttrs: " + unknownAttrs);
			}
			return invalid.length > 0 ? "Invalid attribute(s) - " + invalid : null;
		},
		eval: function() {
			this.set("jobCode", JSONfn.eval(this.get("jobCode")));
		},
		reset: function(metadata) {
			this.set({"metadata": _.isUndefined(metadata) ? this.defaults().metadata : metadata});
		},
		run: function(params) {
			if (TriggerTypes.get(this.get("triggerType")).execute("isJobTriggered", this, params)) {
				TriggerTypes.get(this.get("triggerType")).execute("fire", this, params);
			}
			else {
				TriggerTypes.get(this.get("triggerType")).execute("noFire", this, params);
			}
		}
	});
	var validateTriggerType = function(triggerType, existingTriggerType) {
		return _.isString(triggerType) && (_.isUndefined(existingTriggerType) || _.isEqual(triggerType, existingTriggerType)) && !_.isUndefined(TriggerTypes.get(triggerType));
	};
	var validateTrigger = function(trigger) {
		return _.isString(trigger) || _.isNumber(trigger);
	};
	var validateJobCode = function(jobCode) {
		return (_.isFunction(jobCode) && jobCode.length == 2) ||
				(Job.prototype.isStringFunction(jobCode) && Job.prototype.numParamsInStringFunction(jobCode) == 2);
	};
})();

var JobList = BaseList.extend({
	model: Job,
	fetch: function(options) {
		var returnVal = Backbone.Collection.prototype.fetch.call(this, options);
		
		var unknownTriggerTypes = _.filter(_.uniq(this.pluck("triggerType")), function(triggerType) {
			return _.isUndefined(TriggerTypes.get(triggerType));
		});
		var _this = this;
		_.each(unknownTriggerTypes, function(unknownTriggerType) {
			_this.clear(unknownTriggerType);
		});
		
		if (options && options.evaluate) {
			this.eval();
		}
		return returnVal;
	},
	initialize: function () {
		this.bind("add", function (job) {
			TriggerTypes.get(job.get("triggerType")).execute("onAddJob", job);
		});
		this.bind("remove", function (job) {
			var triggerType = TriggerTypes.get(job.get("triggerType"));
			if (_.isUndefined(triggerType)) {
				// trigger type may never have existed
				return;
			}
			triggerType.execute("onRemoveJob", job);
		});
	},
	nextOrder: function() {
		return this.length ? this.last().get('order') + 1 : 1;
	},
	comparator: function(job) {
		return job.get('order');
	},
	clear: function(triggerType) {
		var jobsToClear = this.filter(function(job) {
			return _.isUndefined(triggerType) || _.isEqual(job.get("triggerType"), triggerType);
		});
		_.each(jobsToClear, function(job) {
			job.destroy();
		});
	}
});

var Scheduler, TriggerTypes, Jobs;
if (!Scheduler) {
	Scheduler = {
		init: function(storeTrigerTypes, storeJobs) {
			_.extend(TriggerTypeList.prototype, {
				storage: new Store("scheduler-triggertypes", storeTrigerTypes),
			});
			TriggerTypes = new TriggerTypeList;
	
			_.extend(JobList.prototype, {
				storage: new Store("scheduler-jobs", storeJobs),
			});
			Jobs = new JobList;
	
			Scheduler.add = function(newObjects, collection, overrideExisting) {
				_.each(newObjects, function(newObj) {
					var currentObj = collection.get(newObj.id);
					if (currentObj) {
						var currentTimestamp = currentObj.get("timestamp");
						var newTimestamp = newObj.timestamp || (overrideExisting ? new Date().getTime() : undefined);
						if (newTimestamp > currentTimestamp) {
							currentObj.save(newObj);
						}
					}
					else {
						collection.create(newObj);
					}
				});
			};
		},
		errorHandlers: [],
		addErrorHandler: function(errorHandler) {
			Scheduler.errorHandlers.push(errorHandler);
		}
	};
}