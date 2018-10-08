/*
finds the element

id: identifier (symbol, name, etc) | string
type: either 'name' or 'symbol' | enum string

return: the position in elements array of the element | num
*/
function findElement(id, type) {
	switch (type.toLowerCase()) {
		case 'name':
			for (var i of elements) {
				if ((i.name).toLowerCase() === id.toLowerCase()) {
					return i.atomicNum - 1;
				}
			}
			break;
		case 'symbol':
			for (var i of elements) {
				if ((i.symbol).toLowerCase() === id.toLowerCase()) {
					return i.atomicNum - 1;
				}
			}
			break;
		default:
			throw 'Invalid type';
	}
	throw 'Invalid identifier';
}
/*
calculates the molar mass of a compound

compd: compound whose molar mass will be found | string

return: the molar mass of the compound | num
*/
function findMolarMass(compd) {
	compd = compd.split('');
	var compdEle = [];
	var numCompd = 1;
	var upper = /[QWERTYUIOPASDFGHJKLZXCVBNM]/;
	var lower = /[qwertyuiopasdfghjklzxcvbnm]/;
	var numeric = /[0-9]/;
	var lastPos = 0;
	var currentEle, currentNum;
	var mass = 0;
	var counter = 0;
	if (numeric.test(compd[0])) {
		for (var l = 0; l < compd.length; l++) {
			if (!numeric.test(compd[l])) {
				numCompd = Number((compd.splice(0, l)).join(''));
				break;
			}
		}
	}
	while (compd.length > 0) {
		counter++;
		if (counter >= 1000000) {
			throw 'Timed out';
		}
		master: for (var i = 0; i < compd.length; i++) {
			if ((upper.test(compd[i]) || compd[i] === '(') && i !== 0) {
				compdEle.push((compd.splice(0, i)).join('') + '1');
				break master;
			} else if (numeric.test(compd[i])) {
				for (var j = 0; j < compd.length; j++) {
					if (!numeric.test(compd[i + j]) || j === compd.length) {
						compdEle.push((compd.splice(0, i + j)).join(''));
						break master;
					}
				}
			} else if (compd[i] === '(') {
				var close = 0;
				var holder = undefined;
				var holder2 = undefined;
				for (var k = 0; k < compd.length; k++) {
					if (close && (upper.test(compd[k]) || compd[k] === '(')) {
						holder = compd.splice(0, k);
						break;
					} else if (k === compd.length - 1) {
						holder = compd.splice(0, k + 1);
						break;
					}
					if (compd[k] === ')') {
						close = k;
					}
				}
				holder.shift();
				close--;
				holder2 = holder.splice(close, (holder.length - close) + 1);
				holder2.shift();
				for (var m = holder2.length - 1; m >= 0; m--) {
					holder.unshift(holder2[m]);
				}
				mass += numCompd * findMolarMass(holder.join(''));
				break master;
			} else if (i === compd.length - 1) {
				compd.push(1);
				break master;
			}
		}
	}
	for (var i = 0; i < compdEle.length; i++) {
		var holder3 = [];
		holder3 = compdEle[i].split('');
		var startNum = holder3.findIndex(function(val) {
			return numeric.test(val);
		});
		currentEle = (holder3.splice(0, startNum)).join('');
		currentNum = holder3.join('');
		mass += toPlace(elements[findElement(currentEle, 'symbol')].molarMass, 2) * currentNum * numCompd;
	}
	return toPlace(mass, 2);
}
/*
rounds to specified number of decimals

val: number to be rounded | num
place: number of decimal places to be rounded to | num

return: formatted number | num
*/
function toPlace(val, place) { //input: val = number, place = number; returns number
	return (Math.floor(val) + parseFloat((val % 1).toFixed(place)));
}
/*
calculates significant figures

num: number whose significant figures will be calculated | num, string

return: number of significant figures in input | num
NOTE: incapable of handling significant zeros
*/
function getSigFig(num) {
	num = (num.toString()).split('');
	var count = 0;
	var flagDot = false;
	if (num.includes('e')) {
		num = num.slice(0, num.indexOf('e'));
	}
	while (num[0] === '0') {
		num.shift();
	}
	if (num.includes('.')) {
		count--;
		flagDot = num.indexOf('.');
	}
	while (num[num.length - 1] === '0' && !flagDot) {
		num.pop();
	}
	var firstNum = num.find(function (element) {
		if (/[1-9]/.test(element)) {
			return true;
		}
	});
	while (flagDot !== false && num[flagDot + 1] === '0' && firstNum > flagDot) {
		num.splice(flagDot + 1, 1);
	}
	return count += num.length;
}
/*
formats a compound (formatted for MathJax display)

compd: the compound to be formatted (places subscripts, etc) | string

return: formatted compound | string
*/
function formatCompd(compd) {
	compd = compd.split('');
	var hold = [];
	for (var i = 0; i < compd.length; i++) {
		if (/[1-9]/.test(compd[i])) {
			hold.push('_' + compd[i]);
			continue;
		}
		hold.push(`"${compd[i]}"`);
	}
	return hold.join('');
}

/*
formats input to scientific notation (formatted for MathJax display)
num: number to be formatted to scientific notation | string

return: formatted number | string
*/
function getSciDisp(num) {
	if (num < 99999 && num > 0.00001) {
		return '' + num;
	}
	num = num.toExponential(getSigFig(num) - 1);
	num = (String(num)).split('e');
	return num[0] + 'xx10^' + (num[1] > 0 ? num[1].slice(1) : num[1]);
}

/*
rounds input to specified number of significant figures

num: number to be rounded | num
sigFigs: number of significant figures to be rounded to | num

returns number with appropriate significant figures as string to avoid automatic dropping of trailing zeroes | string

NOTE: incapable of denoting significant zeros
*/
function roundToSigFig(num, sigFigs) {
	let currentFigs = getSigFig(num);
	let counter = 0;
	num = num.toExponential(getSigFig(num) - 1);
	let exponent = +num.split('e')[1];
	num = ((+num.split('e')[0]).toFixed(sigFigs - 1)).split('');
	num.splice(1, 1);
	if (exponent >= -1) {
		if (exponent >= sigFigs) {
			let numRun = exponent - (num.length - 1);
			for (let i = 0; i < numRun; i++) {
				num.push('0');
			}
		} else if (exponent < sigFigs) {
			num.splice(exponent + 1, 0, '.');
		}
		if (exponent === -1) {
			num.unshift('0');
		}
		return num.join('');
	}
	for (let i = 0; i < Math.abs(exponent) - 1; i++) {
		num.unshift('0');
	}
	return '0.' + num.join('');
}