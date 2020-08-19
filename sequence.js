(function(){
	var stream = function s(){
		return {
			first: undefined,
			rest: s
		};
	};
	var reduce = function r(s, acc, init){
		return function(){
			var _s = s();
			var first = acc(init, _s.first);
			return {
				first: first,
				rest : _s.rest ? r(_s.rest, acc, first): null
			};
		};
	};
	var skip = function(s, n){
		return function(){
			var first, skipped = 0, rest = s;
			do{
				if(!rest){
					return null;
				}
				var result = rest();
				first = result.first;
				rest = result.rest;
			}while(skipped++ < n)
			return {
				first: first,
				rest: rest
			};
		};
	};
	var filter = function f(s, predicate){
		return function(){
			var first, rest = s;
			do{
				if(!rest){
					return null;
				}
				var result = rest();
				first = result.first;
				rest = result.rest;
			}while(!predicate(first))
			return {
				first: first,
				rest: f(rest, predicate)
			};
		};
	};
	var zip = function z(s, t, mapFn){
		if(!s){
			return null;
		}
		return function(){
			var _s = s();
			var otherRest = t;
			var newValue = mapFn(_s.first, function(){
				var _t = t();
				otherRest = _t.rest;
				return _t.first;
			});
			return {
				first: newValue,
				rest: z(_s.rest, otherRest, mapFn)
			};
		};
	};
	var recurse = function r(s, fn){
		var _s = s();
		return fn(_s.first, function(){return r(_s.rest, fn);});
	};
	var take = function t(s, n){
		if(n === 0 || !s){
			return null;
		}
		return function(){
			var _s = s();
			return {
				first: _s.first,
				rest: t(_s.rest, n - 1)
			};
		};
	};

	var toArray = function(s, startIndex, endIndex){
		s = take(skip(s, startIndex), endIndex - startIndex);
		var result = [];
		var rest = s;
		do{
			var _s = rest();
			result.push(_s.first);
			rest = _s.rest;
		}while(rest);
		return result;
	};

	var integers = reduce(stream, x => x + 1, 0);
	

	var isJuf = function(getal){
		if(getal % 7 === 0){
			return true;
		}
		while(getal > 0){
			var laatste = getal % 10;
			if(laatste > 0 && laatste % 7 === 0){
				return true;
			}
			getal = (getal - laatste) / 10;
		}
		return false;
	};
	// var gaTellen = reduce(stream, x => x + 1, 0);

	// var inceptionJuffen = inception(gaTellen, isJuf);
	
	// console.log(`beginning to create array`);
	// var arr = toArray(inceptionJuffen, 0, 100);
	// console.log(arr);

	class Stream{
		constructor(fn){
			this.fn = fn || stream;
		}
		reduce(acc, init){
			return new Stream(reduce(this.fn, acc, init));
		}
		skip(n){
			return new Stream(skip(this.fn, n));
		}
		zip(s, mapFn){
			return new Stream(zip(this.fn, s.fn, mapFn));
		}
		take(n){
			return new Stream(take(this.fn, n));
		}
		filter(predicate){
			return new Stream(filter(this.fn, predicate));
		}
		toArray(startIndex, endIndex){
			return toArray(this.fn, startIndex, endIndex);
		}
		recurse(fn){
			return recurse(this.fn, fn);
		}
		static proxy(getOther){
			return new Stream(() => getOther().fn());
		}
	}
	
	var integers = new Stream().reduce(x => x + 1, 0);
	var inceptionJuffen = integers
		.reduce((_, i) => 
			integers.reduce((_, j) => 
				({value: j, levels: [j]})))
		.recurse((level, getNextLevel) =>
			level.zip(Stream.proxy(getNextLevel), function(integerOnLevel, getIntegerOneLevelUp){
				if(isJuf(integerOnLevel.value)){
					var oneLevelUp = getIntegerOneLevelUp();
					return {value: oneLevelUp.value, levels: integerOnLevel.levels.concat(oneLevelUp.levels)};
				}
				return integerOnLevel;
			}))
		.reduce((_, x) => ({value: x.value, levels: x.levels.slice(0, x.levels.length - 1)}))
	;
	
	console.log(JSON.stringify(inceptionJuffen.filter(x => x.value === 1).toArray(0, 9), null, 1));
})();

