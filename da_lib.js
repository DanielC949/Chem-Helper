/* ? */
function eqStoic(given, find, eq) { //input: given = string in form 'number label compound', find = string in form 'label compound', eq = string; returns array - index 0 is number, index 1 is array
	var top = [];
	var bottom = [];
	var reactants = (eq.split('='))[0];
	var products = (eq.split('='))[1];
	reactants = (reactants.replace(/\s/g, '')).split('+');
	products = (products.replace(/\s/g, '')).split('+');
	given.split(' ');
	find.split(' ');
}

/*
creates formatted string to display input dimensional analysis (formatted for MathJax display)

input: dimensional analysis object (output of getConvI) | obj

returns: formatted string | string
*/
function formatDA(input) {
	let conversionString = '';
	for (let i = 0; i < input.top.length; i++) {
		conversionString += 'xx (' + input.top[i] + ')/(' + input.bottom[i] + ')';
	}
	return '`' + input.initial[0] + '" ' + input.initial[1] + '"' + conversionString + ' = ' + input.answer[0] + '" ' + input.answer[1] + '"' + '`';
}

/*
DEPRECATED
*/
function getConv(from, to, extra) { //input: from = string in form 'number string', to = string, extra = array of conversion objects; returns array - index 0 is number, index 1 is array 		NOTE: only use standard units
	var conv = $.extend(true, [], base_conversions);
	if (extra !== undefined) {
		for (var a = 0; a < extra.length; a++) {
			conv.push(extra[0]);
		}
	}
	var num = conv[conv.length - 1].cuid;
	for (var i = conv.length - 1; i >= 0; i--) {
		var hold = conv[i];
		num++;
		conv.push(new Conversion(hold.tags[1], hold.tags[0], hold.c_vals[1], hold.c_vals[0], num));
	}
	var count = 0;
	var possible = [];
	var hold2 = [];
	var flag;
	from = from.split(' ');
	for (var j = 0; j < conv.length; j++) {
		if (conv[j].tags[1] === from[1]) {
			hold2.push(conv[j].cuid);
		}
	}
	if (hold2.length === 0) {
		throw 'Unknown unit ' + from[1];
	}
	possible.push(hold2);
	master: while (count < 100) {
		for (var k = 0; k < possible[count].length; k++) {
			if (conv[possible[count][k]].tags[0] === to) {
				flag = k;
				break master;
			}
		}
		hold2 = [];
		for (var l = 0; l < possible[count].length; l++) {
			for (var m = 0; m < conv.length; m++) {
				if (conv[m].tags[1] === conv[possible[count][l]].tags[0]) {
					if (conv[m].tags[0] !== conv[possible[count][l]].tags[1]) {
						hold2.push(m);
					}
				}
			}
		}
		possible.push(hold2);
		count++;
	}
	if (count >= 100) {
		throw 'Unknown unit ' + to;
	}
	var confirmed = [];
	if (count === 0) {
		var known = conv[possible[0][flag]];
		return [((from[0] * known.c_vals[0])) / known.c_vals[1], [from[0] + ' ' + from[1], {top: known.d_vals[0], bottom: known.d_vals[1]}]];
	}
	for (var r = 0; r < possible[count].length; r++) {
		if (conv[possible[count][r]].tags[0] === to) {
			confirmed.unshift(possible[count][r]);
			flag = r;
			count--;
			break;
		}
	}
	while (count > 0) {
		var temp = possible[count][flag];
		for (var n = 0; n < possible[count - 1].length; n++) {
			if (conv[temp].tags[1] === conv[possible[count - 1][n]].tags[0]) {
				confirmed.unshift(possible[count][n]);
				flag = n;
				count--;
				break;
			}
		}
	}
	for (var o = 0; o < possible[0].length; o++) {
		if (conv[possible[0][o]].tags[1] === from[1] && (conv[possible[0][o]].tags[0] === from[1] || conv[possible[0][o]].tags[0] === conv[confirmed[0]].tags[1])) {
			confirmed.unshift(possible[0][o]);
			break;
		}
	}
	var out = [];
	var t_val = from[0];
	var b_val = 1;
	out.push(from[0] + ' ' + from[1]);
	for (var p = 0; p < confirmed.length; p++) {
		var current = conv[confirmed[p]];
		t_val *= current.c_vals[0];
		b_val *= current.c_vals[1];
		var temp2 = {top: current.d_vals[0], bottom: current.d_vals[1]};
		out.push(temp2);
	}
	return [t_val / b_val, out];
}

/*
Gets the conversions sequence and result from startAmount of from to to, using additional conversions extra if needed

startAmount: the amount or number of starting unit | num
from: starting unit | string
to: unit to convert to | string
extra: extra conversions that are not baseline | array of Conversion objects

returns object with following properties:
initial: array with initial amount and unit | initial[0]: initial amount | num, initial[1]: starting unit | string
top: array of formatted strings for top half of all needed conversions | array of string (formatted for MathJax display)
bottom: array of formatted strings for bottom half of all needed conversions | array of string (formatted for MathJax display)
answer: array with calculated result and unit | answer[0]: calculated result | num, answer[1]: calculated unit | string
*/
function getConvI(startAmount, from, to, extra) {
	let thisConv;
	if (extra === undefined) {
		thisConv = $.extend(true, [], conversions);
	} else {
		thisConv = getExtendedConv(extra, true);
	}
	let nodePath = [];
	let counter = 0;
	function getNodes(startNode) {
		if (counter++ > 10000) {
			throw 'Could not find conversion sequence in time';
		}
		let startUnit = thisConv[startNode].tags[0];
		if (startUnit === to) { //checks if node is the one we're searching for
			throw 'Found';
		}
		let childNodes = [];
		top: for (let i = 0; i < thisConv.length; i++) { //checks for any viable children of startNode, pushes viables to childNodes
			if (thisConv[i].tags[1] === startUnit && !nodePath.includes(thisConv[i].cuid)) {
				for (let j = 0; j < nodePath.length; j++) {
					if (thisConv.length - thisConv[i].cuid - 1 === nodePath[j]) {
						continue top;
					}
				}
				childNodes.push(thisConv[i].cuid);
			}
		}
		if (childNodes.length === 0) { //if there are no viable children, continue to next (node will be removed after call)
			return null;
		}
		for (let i = 0; i < childNodes.length; i++) { //checks all child nodes
			nodePath.push(childNodes[i]);
			getNodes(childNodes[i]);
			nodePath.pop();
		}
	}
	let topNodes = [];
	for (let i = 0; i < thisConv.length; i++) {
		if (thisConv[i].tags[1] === from) {
			topNodes.push(thisConv[i].cuid);
		}
	}
	try {
		for (let i = 0; i < topNodes.length; i++) {
			nodePath.push(topNodes[i]);
			getNodes(topNodes[i]);
			nodePath.pop();
		}
	} catch (e) {
		if (e !== 'Found') {
			throw e;
		}
	}

	let result = {
		initial: [startAmount, from],
		top: [],
		bottom: [],
		answer: [0, to]
	};
	let calculation = startAmount;
	for (let i = 0; i < nodePath.length; i++) {
		calculation *= (thisConv[nodePath[i]].c_vals[0] / thisConv[nodePath[i]].c_vals[1]);
		result.top.push(thisConv[nodePath[i]].d_vals[0]);
		result.bottom.push(thisConv[nodePath[i]].d_vals[1]);
	}
	result.answer[0] = roundToSigFig(calculation, getSigFig(startAmount));

	return result;
}

function getExtendedConv(extra, flip) {	
	let thisConv = $.extend(true, [], base_conversions);
	let ids = thisConv[thisConv.length - 1].cuid + 1;
	for (let i = 0; i < extra.length; i++) {
		thisConv.push(new Conversion(extra[i].tag1, extra[i].tag2, extra[i].c_val1, extra[i].c_val2, ids));
		if (flip) {
			thisConv.push(new Conversion(extra[i].tag2, extra[i].tag1, extra[i].c_val2, extra[i].c_val1, ids + 1));
			ids += 2;
		} else {
			ids++;
		}
	}
	return thisConv;
}

function getStandardConvFactor(from, to) { //input: from = string, to = string; returns number
	var flagFrom = 1;
	var flagTo = 1;
	for (var i = metricPre.length - 1; i >= 0; i--) {
		if (!flagFrom && from.includes(metricPre[i].symbol)) {
			flagFrom = metricPre[i].exp;
		}
		if (!flagTo && to.includes(metricPre[i].symbol)) {
			flagTo = metricPre[i].exp;
		}
	}
	return flagFrom - flagTo;
}

function identifyUnit(input) {
	var i_joined = input;
	input = input.split('');
	if (i_joined === 'mmHg' || i_joined === 'mol' || i_joined === 'm') {
		return {posInMetricPre: null, unit: i_joined};
	}
	if (input[1] === 'a' && input[0] === 'd') {
		//return [5, (input.slice(2, input.length)).join('')];
		return {posInMetricPre: 5, unit: (input.slice(2, input.length)).join('')};
	}
	for (var i = 0; i < metricPre.length; i++) {
		if (input[0] === metricPre[i].symbol) {
			//return [i, (input.slice(1, input.length)).join('')];
			return {posInMetricPre: i, unit: (input.slice(1, input.length)).join('')};
		}
	}
	return {posInMetricPre: null, unit: i_joined};;
}