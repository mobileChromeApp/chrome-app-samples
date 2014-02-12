var Parser = {};

(function() {

  var extend = function(prototypeObject, methodImplObject) {
    var methodName;
    var methodImpl;
    for (methodName in methodImplObject) {
      methodImpl = methodImplObject[methodName];
      if (methodImplObject.hasOwnProperty(methodName)) {
        prototypeObject[methodName] = methodImpl;
      }
    }
  };

  var isString = function(possibleString) {
    return typeof(possibleString) == 'string';
  };

  var isCharacter = function(possibleCharacter) {
    return isString(possibleCharacter) && (possibleCharacter.length == 1);
  };

  var characterRangeString = function(firstCharacter, lastCharacter) {
    var characterRangeString = '';
    var firstCharCode = firstCharacter.charCodeAt(0);
    var lastCharCode = lastCharacter.charCodeAt(0);
    var charCode = firstCharCode;
    var character = String.fromCharCode(charCode);
    for (; charCode <= lastCharCode; charCode = charCode + 1) {
      character = String.fromCharCode(charCode);
      characterRangeString = characterRangeString.concat(character);
    }
    App.Log('firstCharacter: ' + firstCharacter +
      ' lastCharacter: ' + lastCharacter +
      ' characterRangeString: ' + characterRangeString);
    return characterRangeString;
  };

  var allDigits = function() {
    return characterRangeString('0', '9');
  };

  var allLowerCaseLetters = function() {
    return characterRangeString('a', 'z');
  };

  var allUpperCaseLetters = function() {
    return characterRangeString('A', 'Z');
  };

  var allHexadecimalCharacters = function() {
    return characterRangeString('A', 'F').concat(
      characterRangeString('a', 'f').concat(
        allDigits()));
  };

  var countDecimalDigits = function(value) {
    var nDigits = 0;
    if (value < 0) {
      return 0;
    }
    if (value === 0) {
      return 1;
    }
    while (value > 0) {
      value = Math.floor(value / 10);
      nDigits = nDigits + 1;
    }
    return nDigits;
  };

  Parser.Exception = function(errorMessage) {
    this.init(errorMessage);
  };

  extend(Parser.Exception.prototype, {
    init: function(errorMessage) {
      var self = this;
      self.errorMessage = errorMessage;
    },

    getErrorMessage: function() {
      var self = this;
      return self.errorMessage;
    }
  });

  Parser.InStream = function(contentString) {
    this.init(contentString);
  };

  extend(Parser.InStream.prototype, {
    init: function(contentString) {
      var self = this;

      if (!isString(contentString)) {
        throw new Parser.Exception(
          'Parser.InStream.init');
      }

      self._contentString = contentString;
      self._position = 0;
      self._mark = 0;
      self._end = contentString.length;
    },

    position: function() {
      var self = this;
      return self._position;
    },

    setPosition: function(position)  {
      var self = this;
      if ((position < 0) || (position > self.end())) {
        throw new Parser.Exception(
          'Parser.InStream.setPosition');
      }
      self._position = position;
      return position;
    },

    mark: function() {
      var self = this;
      return self._mark;
    },

    setMark: function(mark) {
      var self = this;
      if ((mark < 0) || (mark > self.position())) {
        throw new Parser.Exception(
          'Parser.InStream.setMark');
      }
      self._mark = mark;
      return mark;
    },

    end: function() {
      var self = this;
      return self._end;
    },

    remaining: function() {
      var self = this;
      return self.end() - self.position();
    },

    currentCharacter: function() {
      var self = this;
      if (self.position() == self.end()) {
        throw new Parser.Exception(
          'Parser.InStream.current');
      }
      return self._contentString.charAt(self.position());
    },

    markedCharacterRange: function() {
      var self = this;
      var length = self.position() - self.mark();
      if (length === 0) {
        return '';
      }
      return self._contentString.substr(self.mark(), length);
    },

    advance: function() {
      var self = this;
      if (self.position() == self.end()) {
        throw new Parser.Exception(
          'Parser.InStream.readCharacter');
      }
      self.setPosition(self.position() + 1);
    }
  });

  Parser.CharacterSet = function(characterString) {
    this.init(characterString);
  };

  extend(Parser.CharacterSet.prototype, {
    init: function(characterString) {
      var self = this;
      self.characterString = characterString;
    },

    hasMember: function(character) {
      var self = this;
      if (!isCharacter(character)) {
        throw new Parser.Exception(
          'CharacterSet.isMember');
      }
      return (self.characterString.indexOf(character) != -1);
    }
  });

  Parser.Character = function(characterString) {
    this.init(characterString);
  };

  extend(Parser.Character.prototype, {
    init: function(characterString) {
      var self = this;
      self.characterSet = new Parser.CharacterSet(
        characterString);
    },

    parse: function(parseState) {
      var self = this;
      var inStream = parseState.inStream;
      App.Log('Parser.Character.parse');
      if (inStream.remaining() === 0) {
        return false;
      }
      if (self.characterSet.hasMember(inStream.currentCharacter())) {
        App.Log(inStream.currentCharacter());
        inStream.advance();
        return true;
      } else {
        return false;
      }
    }
  });

  Parser.Not = function(parser) {
    this.init(parser);
  };

  extend(Parser.Not.prototype, {
    init: function(parser) {
      var self = this;
      self.parser = parser;
    },

    parse: function(parseState) {
      var self = this;
      var inStream = parseState.inStream;
      var mark = inStream.setMark(inStream.position());
      App.Log('Parser.Not.parse');
      if (inStream.remaining() === 0) {
        return true;
      }
      if (self.parser.parse(parseState)) {
        inStream.setPosition(mark);
        return false;
      } else {
        return true;
      }
    }
  });

  Parser.Optional = function(parser) {
    this.init(parser);
  };

  extend(Parser.Optional.prototype, {
    init: function(parser) {
      var self = this;
      self.parser = parser;
    },

    parse: function(parseState) {
      var self = this;
      var inStream = parseState.inStream;
      var mark = inStream.setMark(inStream.position());
      App.Log('Parser.Optional.parse');
      if (inStream.remaining() === 0) {
        return true;
      }
      if (!self.parser.parse(parseState)) {
        inStream.setPosition(mark);
      }
      return true;
    }
  });

  Parser.Repeat = function(parser, min, max) {
    this.init(parser, min, max);
  };

  extend(Parser.Repeat.prototype, {
    init: function(parser, min, max) {
      var self = this;
      self.parser = parser;
      self.min = min;
      if (max !== undefined) {
        self.max = max;
      } else {
        self.max = min;
      }
    },

    parse: function(parseState) {
      var self = this;
      var count = 0;
      var doParse = true;
      var inStream = parseState.inStream;
      var mark = inStream.setMark(inStream.position());
      App.Log('Parser.Repeat.parse');
      if (inStream.remaining() === 0) {
        return false;
      }
      while (doParse) {
        if (self.parser.parse(parseState)) {
          count = count + 1;
          if (count == self.max) {
            doParse = false;
          }
        } else {
          doParse = false;
        }
      }
      if ((count >= self.min) && (count <= self.max)) {
        return true;
      } else {
        inStream.setPosition(mark);
        return false;
      }
    }
  });

  Parser.RepeatAny = function(parser) {
    this.init(parser);
  };

  extend(Parser.RepeatAny.prototype, {
    init: function(parser) {
      var self = this;
      self.parser = parser;
    },

    parse: function(parseState) {
      var self = this;
      var doParse = true;
      var inStream = parseState.inStream;
      var mark = inStream.setMark(inStream.position());
      App.Log('Parser.RepeatAny.parse');
      if (inStream.remaining() === 0) {
        return true;
      }
      while (doParse) {
        mark = inStream.setMark(inStream.position());
        if (self.parser.parse(parseState)) {
          doParse = true;
        } else {
          inStream.setPosition(mark);
          doParse = false;
        }
      }
      return true;
    }
  });

  Parser.RepeatAtLeastOnce = function(parser) {
    this.init(parser);
  };

  extend(Parser.RepeatAtLeastOnce.prototype, {
    init: function(parser) {
      var self = this;
      self.parser = parser;
    },

    parse: function(parseState) {
      var self = this;
      var doParse = true;
      var inStream = parseState.inStream;
      var mark = inStream.setMark(inStream.position());
      App.Log('Parser.RepeatAtLeastOnce.parse');
      if (inStream.remaining() === 0) {
        return true;
      }
      if (!self.parser.parse(parseState)) {
        inStream.setPosition(mark);
        return false;
      }
      while (doParse) {
        mark = inStream.setMark(inStream.position());
        if (self.parser.parse(parseState)) {
          doParse = true;
        } else {
          inStream.setPosition(mark);
          doParse = false;
        }
      }
      return true;
    }
  });


  Parser.LookAhead = function(parser) {
    this.init(parser);
  };

  extend(Parser.LookAhead.prototype, {
    init: function(parser) {
      var self = this;
      self.parser = parser;
    },

    parse: function(parseState) {
      var self = this;
      var inStream = parseState.inStream;
      var mark = inStream.setMark(inStream.position());
      App.Log('Parser.LookAhead.parse');
      if (inStream.remaining() === 0) {
        return true;
      }
      if (self.parser.parse(parseState)) {
        inStream.setPosition(mark);
        return true;
      } else {
        inStream.setPosition(mark);
        return false;
      }
    }
  });

  Parser.Or = function(parserArray) {
    this.init(parserArray);
  };

  extend(Parser.Or.prototype, {
    init: function(parserArray) {
      var self = this;
      self.parserArray = parserArray;
    },

    parse: function(parseState) {
      var self = this;
      var inStream = parseState.inStream;
      var mark = inStream.setMark(inStream.position());
      var index = 0;
      var parser = self.parserArray[index];
      App.Log('Parser.Or.parse');
      if (inStream.remaining() === 0) {
        return false;
      }
      for (index = 0; index < self.parserArray.length; index = index + 1) {
        parser = self.parserArray[index];
        if (parser.parse(parseState)) {
          return true;
        } else {
          inStream.setPosition(mark);
        }
      }
      return false;
    }
  });

  Parser.And = function(parserArray) {
    this.init(parserArray);
  };

  extend(Parser.And.prototype, {
    init: function(parserArray) {
      var self = this;
      self.parserArray = parserArray;
    },

    parse: function(parseState) {
      var self = this;
      var inStream = parseState.inStream;
      var mark = inStream.setMark(inStream.position());
      var index = 0;
      var parser = self.parserArray[index];
      App.Log('Parser.And.parse');
      if (inStream.remaining() === 0) {
        return false;
      }
      for (index = 0; index < self.parserArray.length; index = index + 1) {
        parser = self.parserArray[index];
        if (!parser.parse(parseState)) {
          inStream.setPosition(mark);
          return false;
        }
      }
      return true;
    }
  });

  Parser.characterSet = function(characterString) {
    return new Parser.CharacterSet(characterString);
  };

  Parser.character = function(characterString) {
    return new Parser.Character(characterString);
  };

  Parser.not = function(parser) {
    return new Parser.Not(parser);
  };

  Parser.optional = function(parser) {
    return new Parser.Optional(parser);
  };

  Parser.repeat = function(parser, min, max) {
    return new Parser.Repeat(parser, min, max);
  };

  Parser.repeatAny = function(parser) {
    return new Parser.RepeatAny(parser);
  };

  Parser.repeatAtLeastOnce = function(parser) {
    return new Parser.RepeatAtLeastOnce(parser);
  };

  Parser.lookAhead = function(parser) {
    return new Parser.LookAhead(parser);
  };

  Parser.or = function(parserArray) {
    return new Parser.Or(parserArray);
  };

  Parser.and = function(parserArray) {
    return new Parser.And(parserArray);
  };

  Parser.lowerCase = function() {
    var parser = Parser;
    return parser.character(allLowerCaseLetters());
  };

  Parser.upperCase = function() {
    var parser = Parser;
    return parser.character(allUpperCaseLetters());
  };

  Parser.alphabetic = function() {
    var parser = Parser;
    return parser.or([
      parser.lowerCase(),
      parser.upperCase()]);
  };

  Parser.hexadecimal = function() {
    var parser = Parser;
    return parser.character(allHexadecimalCharacters());
  };

  Parser.digit = function() {
    var parser = Parser;
    return parser.character(allDigits());
  };

  Parser.alphaNumermic = function() {
    var parser = Parser;
    return parser.or([
      parser.alphabetic(),
      parser.digit()]);
  };

  Parser.Decimal = function(min, max) {
    this.init(min, max);
  };

  extend(Parser.Decimal.prototype, {
    init: function(min, max) {
      var self = this;
      var parser = Parser;
      var nDigitsMin = countDecimalDigits(min);
      var nDigitsMax = countDecimalDigits(max);

      self.min = min;
      self.max = max;
      self.parser = parser.repeat(parser.digit(), nDigitsMin, nDigitsMax);
    },

    parse: function(parseState) {
      var self = this;
      var inStream = parseState.inStream;
      var mark = inStream.setMark(inStream.position());
      var valueString = '';
      var value = NaN;

      App.Log('Parser.Decimal.parse');

      if (inStream.remaining() === 0) {
        return false;
      }

      if (self.parser.parse(parseState)) {
        inStream.setMark(mark);
        valueString = inStream.markedCharacterRange();
        value = parseInt(valueString, 10);
        if (isNaN(value)) {
          inStream.setPosition(mark);
          return false;
        } else if ((value >= self.min) && (value <= self.max)) {
          parseState.value = value;
          return true;
        }
      } else {
        inStream.setPosition(mark);
        return false;
      }
    }
  });

  Parser.decimal = function(min, max) {
    return new Parser.Decimal(min, max);
  };

  Parser.Byte = function() {
    this.init();
  };

  extend(Parser.Byte.prototype, {
    init: function() {
      var self = this;
      var parser = Parser;

      self.parser = parser.decimal(0, 255);
    },

    parse: function(parseState) {
      var self = this;
      var inStream = parseState.inStream;
      var mark = inStream.setMark(inStream.position());
      var value = NaN;

      App.Log('Parser.Byte.parse');

      if (inStream.remaining() === 0) {
        return false;
      }

      if (self.parser.parse(parseState)) {
        return true;
      } else {
        inStream.setPosition(mark);
        return false;
      }
    }
  });

  Parser.byte = function() {
    return new Parser.Byte();
  };

  Parser.Address = {};

  Parser.Address.IPv4 = function() {
    this.init();
  };

  extend(Parser.Address.IPv4.prototype, {
    init: function() {
      var self = this;
      var parser = Parser;

      self.parser = parser.and([
        parser.repeat(
          parser.and([
            parser.byte(),
            parser.character('.')]),
          3),
        parser.byte()]);
    },

    parse: function(parseState) {
      var self = this;
      var inStream = parseState.inStream;
      var mark = inStream.setMark(inStream.position());

      App.Log('Parser.Address.IPv4.parse');

      if (inStream.remaining() === 0) {
        return false;
      }

      if (self.parser.parse(parseState)) {
        inStream.setMark(mark);
        parseState.address = inStream.markedCharacterRange();
        return true;
      } else {
        inStream.setPosition(mark);
        return false;
      }
    }
  });

  Parser.Address.ipv4 = function() {
    return new Parser.Address.IPv4();
  };

  Parser.Address.IPv6 = function() {
    this.init();
  };

  extend(Parser.Address.IPv6.prototype, {
    init: function() {
      var self = this;
      var parser = Parser;

      self.prefixParser = parser.character('[');
      self.addressParser = parser.and([
        parser.repeat(
          parser.and([
            parser.repeat(parser.hexadecimal(), 1, 4),
            parser.character(':')]),
          7),
        parser.repeat(parser.hexadecimal(), 1, 4)]);
      self.postfixParser = parser.character(']');
    },

    parse: function(parseState) {
      var self = this;
      var inStream = parseState.inStream;
      var mark = inStream.setMark(inStream.position());
      var addressMark = mark;
      var address = '';

      App.Log('Parser.Address.IPv6');

      if (inStream.remaining() === 0) {
        return false;
      }

      if (!self.prefixParser.parse(parseState)) {
        inStream.setPosition(mark);
        return false;
      }

      addressMark = inStream.setMark(inStream.position());

      if (self.addressParser.parse(parseState)) {
        inStream.setMark(addressMark);
        address = inStream.markedCharacterRange();

        if (self.postfixParser.parse(parseState)) {
          parseState.address = address;
          return true;
        } else {
          inStream.setPosition(mark);
          return false;
        }
      } else {
        inStream.setPosition(mark);
        return false;
      }
    }
  });

  Parser.Address.ipv6 = function() {
    return new Parser.Address.IPv6();
  };

  Parser.Address.Port = function() {
    this.init();
  };

  extend(Parser.Address.Port.prototype, {
    init: function() {
      var self = this;
      var parser = Parser;

      self.parser = parser.and([
        parser.repeat(parser.character(':'), 1, 2),
        parser.decimal(1, 65535)]);
    },

    parse: function(parseState) {
      var self = this;
      var inStream = parseState.inStream;
      var mark = inStream.setMark(inStream.position());

      App.Log('Parser.Address.Port.parse');

      if (inStream.remaining() === 0) {
        return false;
      }

      if (self.parser.parse(parseState)) {
        parseState.port = parseState.value;
        return true;
      } else {
        inStream.setPosition(mark);
        return false;
      }
    }
  });

  Parser.Address.port = function() {
    return new Parser.Address.Port();
  };

  Parser.Address.Display = function() {
    this.init();
  };

  extend(Parser.Address.Display.prototype, {
    init: function() {
      var self = this;
      var parser = Parser;

      self.parser = parser.and([
        parser.character(':'),
        parser.decimal(0, 99)]);
    },

    parse: function(parseState) {
      var self = this;
      var inStream = parseState.inStream;
      var mark = inStream.setMark(inStream.position());

      App.Log('Parser.Address.Display.parse');

      if (inStream.remaining() === 0) {
        return false;
      }

      if (self.parser.parse(parseState)) {
        parseState.port = 5900 + parseState.value;
        return true;
      } else {
        inStream.setPosition(mark);
        return false;
      }
    }
  });

  Parser.Address.display = function() {
    return new Parser.Address.Display();
  };

  Parser.Address.HostName = function() {
    this.init();
  };

  extend(Parser.Address.HostName.prototype, {
    init: function() {
      var self = this;
      var parser = Parser;

      // See section 3.5 of RFC 1034 and section 2.1 of RFC 1123
      var letterDigit = parser.alphaNumermic();

      var hypen = parser.character('-');

      var letterDigitHypenString = parser.repeatAny(
        parser.or([
          parser.and([
            parser.lookAhead(
              parser.and([
                parser.repeatAtLeastOnce(hypen),
                letterDigit])),
            parser.repeatAtLeastOnce(hypen)]),
          letterDigit]));

      var label = parser.and([
        letterDigit,
        letterDigitHypenString]);

      var subDomain = parser.and([
        parser.repeatAny(
          parser.and([
            label,
            parser.character('.')])),
        label]);

      var domain = parser.or([
        subDomain,
        parser.character(' ')]);

      self.parser = domain;
    },

    parse: function(parseState) {
      var self = this;
      var inStream = parseState.inStream;
      var mark = inStream.setMark(inStream.position());

      App.Log('Parser.Address.HostName.parse');

      if (inStream.remaining() === 0) {
        return false;
      }

      if (self.parser.parse(parseState)) {
        inStream.setMark(mark);
        parseState.address = inStream.markedCharacterRange();
        return true;
      } else {
        inStream.setPosition(mark);
        return false;
      }
    }
  });

  Parser.Address.hostName = function() {
    return new Parser.Address.HostName();
  };

  Parser.Address.parse = function(possibleAddress) {
    var inStream = new Parser.InStream(possibleAddress);
    var didParse = false;
    var parseState = {
      inStream: inStream
    };

    var parser = Parser;
    var address = Parser.Address;

    var displayOrPort = parser.optional(
      parser.or([
        parser.and([
          parser.lookAhead(
            parser.and([
              address.display(),
              parser.not(parser.digit())])),
          address.display()]),
        address.port()]));

    var addressParser = parser.or([
      parser.and([
        address.ipv4(),
        displayOrPort]),
      parser.and([
        address.ipv6(),
        displayOrPort]),
      parser.and([
        address.hostName(),
        displayOrPort])]);

    didParse = addressParser.parse(parseState);

    parseState.didParse = didParse;

    return parseState;
  };

})();
