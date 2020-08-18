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

	var replace = function r(s, t, shouldReplace){
		if(!s){
			return null;
		}
		return function(){
			var first, rest, _s = s();
			if(shouldReplace(_s.first)){
				var _t  = t();
				return {
					first: _t.first,
					rest: r(_s.rest, _t.rest, shouldReplace)
				};
			}else{
				return {
					first: _s.first,
					rest: r(_s.rest, t, shouldReplace)
				};
			}
		};
	};

	var inception = function(s, shouldReplace){
		return (function inc(s, level){
			s = reduce(s, (_, x) => ({value: x.value, level: level}));
			return replace(s, () => inc(s, level + 1)(), x => shouldReplace(x.value));
		})(reduce(s, (_, x) => ({value:x, level: 0})), 0);
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

	// var isJuf = function(getal){
	// 	if(getal % 7 === 0){
	// 		return true;
	// 	}
	// 	while(getal > 0){
	// 		var laatste = getal % 10;
	// 		if(laatste > 0 && laatste % 7 === 0){
	// 			return true;
	// 		}
	// 		getal = (getal - laatste) / 10;
	// 	}
	// 	return false;
	// };
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
		replace(shouldReplace, s){
			return new Stream(replace(this.fn, s, shouldReplace));
		}
		skip(n){
			return new Stream(skip(this.fn, n));
		}
		take(n){
			return new Stream(take(this.fn, n));
		}
		toArray(startIndex, endIndex){
			return toArray(this.fn, startIndex, endIndex);
		}
	}
	
	var integers = new Stream().reduce(x => x + 1, 0);
	var integersOnLevels = integers.reduce((_, level) => integers.reduce((_, value) => ({value: value, level: level})));
	
})();

