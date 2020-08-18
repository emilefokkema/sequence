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
	var zipped = zip(integers, integers, function(item, other){
		if(item % 3 === 0){
			return other();
		}
		return item;
	});
	console.log(toArray(zipped, 0, 10));

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
	
})();

