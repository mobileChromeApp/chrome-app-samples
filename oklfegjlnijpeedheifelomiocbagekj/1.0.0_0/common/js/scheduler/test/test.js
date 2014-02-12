var storeTrigerTypes = false;
var storeJobs = true;
var deleteObjects = false;
var overrideExisting = false;

Scheduler.init(storeTrigerTypes, storeJobs);

TriggerTypes.fetch({evaluate: true});

(function() {
	var numTriggerTypes = TriggerTypes.length;
	var numTriggerTypeIds = TriggerTypes.pluck("id").length;
	test("Initial TriggerTypes", function() {
		ok(numTriggerTypes == numTriggerTypeIds, "TriggerTypes(.ids) length");
		ok((!storeTrigerTypes || deleteObjects) ? numTriggerTypes == 0 : numTriggerTypes == 4, "Number of TriggerTypes:" + numTriggerTypes);
	});
})();

console.log("TriggerTypes: ", TriggerTypes.pluck("id"));
var cronTriggerType = TriggerTypes.get("cron");
if (!_.isUndefined(cronTriggerType)) {
	console.log("TriggerType.cron ", cronTriggerType.toJSON());
}
Scheduler.add([
	{id:"cron",
		onAddJob: function(job){console.log('cron onAddJob1: ', job.id); TriggerTypes.get("cron").defaults.onAddJob(job);},
    	onRemoveJob: function(job){console.log('cron onRemoveJob1: ', job.id); TriggerTypes.get("cron").defaults.onRemoveJob(job);},
    	isJobTriggered: function(job, params){console.log('cron isJobTriggered1: ', job.id); return false;},
    	fire: function(job, params){console.log('cron fire1: ', job.id); TriggerTypes.get("cron").defaults.fire(job);},
		noFire: function(job, params){console.log('cron noFire1: ', job.id);}
	}
], TriggerTypes, overrideExisting);
console.log("TriggerTypes: ", TriggerTypes.pluck("id"));
if (_.isUndefined(cronTriggerType)) {
	cronTriggerType = TriggerTypes.get("cron");
}
console.log("TriggerType.cron ", cronTriggerType.toJSON());
console.log("Updating TriggerType.cron.noFire")
cronTriggerType.set("noFire", function(job, params){console.log('cron noFire2');})
console.log("TriggerType.cron ", cronTriggerType.toJSON());
Scheduler.add([
	{id:"url-regex",
		isJobTriggered: function(job, params){console.log('url-regex isJobTriggered1: ', job.id); return false;},
	}
], TriggerTypes, overrideExisting);
console.log("TriggerType.url-regex ", TriggerTypes.get("url-regex").toJSON());
console.log("Updating TriggerType.url-regex.isJobTriggered")
TriggerTypes.get("url-regex").set("isJobTriggered", function(job, params){console.log('url-regex isJobTriggered2: ', job.id); return false;});
console.log("TriggerType.url-regex ", TriggerTypes.get("url-regex").toJSON());
Scheduler.add([
	{id:"time-elapsed"},
	{id:"visits-elapsed"}
], TriggerTypes, overrideExisting);
console.log("TriggerTypes: ", TriggerTypes.pluck("id"));
console.log("Removing TriggerType.url-regex");
if (deleteObjects) {
	TriggerTypes.remove("url-regex");
}
console.log("TriggerTypes: ", TriggerTypes.pluck("id"));

Jobs.fetch({evaluate: true});

console.log("Jobs: ", Jobs.pluck("id"));
Scheduler.add([
	{id:"maintenance", triggerType:"cron", trigger:"trigger", jobCode:function(metadata, params){console.log('maintenance job_code1');}},
], Jobs, overrideExisting);
console.log("Jobs: ", Jobs.pluck("id"));
var cron_maintenance = Jobs.get("maintenance");
console.log("Job.maintenance: ", cron_maintenance.toJSON());
console.log("Updating Job.maintenance.trigger/jobCode")
cron_maintenance.set({trigger:"trigger2", jobCode:function(metadata, params){console.log('maintenance job_code2');}});
console.log("Job.maintenance: ", cron_maintenance.toJSON());
console.log("Running Job.maintenance");
cron_maintenance.run();
console.log("Updating Job.maintenance.isJobTriggered")
cronTriggerType.set("isJobTriggered", function(job, params){console.log('cron isJobTriggered2: ', job.id); return true;});
console.log("Running Job.maintenance");
cron_maintenance.run();
console.log("Job.maintenance.metadata: ", JSONfn.stringify(cron_maintenance.get("metadata")));
console.log("Updating Job.maintenance.metadata")
cron_maintenance.get("metadata").now = new Date();
console.log("Job.maintenance.metadata: ", JSONfn.stringify(cron_maintenance.get("metadata")));
console.log("Resetting Job.maintenance")
cron_maintenance.reset();
console.log(JSONfn.stringify(cron_maintenance.toJSON()));
console.log("Job.maintenance.metadata: ", JSONfn.stringify(cron_maintenance.get("metadata")));
Scheduler.add([
	{id:"20_sec_alert", triggerType:"time-elapsed", trigger:20 * 1000, jobCode:function(metadata, params){console.log('20_sec_alert job_code1');}},
	{id:"30_sec_alert", triggerType:"time-elapsed", trigger:30 * 1000, jobCode:function(metadata, params){console.log('30_sec_alert job_code1');}}
], Jobs, overrideExisting);
console.log("Jobs: ", Jobs.pluck("id"));
console.log("Job.20_sec_alert: ", Jobs.get("20_sec_alert").toJSON());
console.log("Updating Job.20_sec_alert.jobCode")
Jobs.get("20_sec_alert").set("jobCode", function(metadata, params){console.log('20_sec_alert job_code2');});
console.log("Job.20_sec_alert: ", Jobs.get("20_sec_alert").toJSON());
console.log("Jobs.cron: ", jobsToJSON(Jobs.where({triggerType: "cron"})));
console.log("Jobs.time-elapsed", jobsToJSON(Jobs.where({triggerType: "time-elapsed"})));
console.log("Removing Job.maintenance");
if (deleteObjects) {
	Jobs.remove("maintenance");
}
console.log("Jobs: ", Jobs.pluck("id"));
console.log("Jobs.cron: ", jobsToJSON(Jobs.where({triggerType: "cron"})));
console.log("Clearing Jobs of TriggerType 'time-elapsed'");
if (deleteObjects) {
	Jobs.clear("time-elapsed");
}
console.log("Jobs: ", Jobs.pluck("id"));
console.log("Jobs.time-elapsed", jobsToJSON(Jobs.where({triggerType: "time-elapsed"})));
console.log("Clearing TriggerTypes");
if (deleteObjects) {
	TriggerTypes.clear();
}
console.log("TriggerTypes: ", TriggerTypes.pluck("id"));

function jobsToJSON(jobs) {
	var jobsJSON = [];
	_.map(jobs, function(job){
		jobsJSON.push(job.toJSON());
	});
	return jobsJSON;
};