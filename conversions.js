function Conversion(tag1, tag2, c_val1, c_val2, cuid) {
	this.tags = [tag1, tag2];
	this.c_vals = [c_val1, c_val2];
	this.d_vals = [getSciDisp(c_val1) + ' " ' + tag1 + '"', getSciDisp(c_val2) + ' " ' + tag2 + '"'];
	this.cuid = cuid;
}

var conversions = [
	new Conversion('mol', 'molec', 1, 6.022e+23, 0),
	new Conversion('mol', 'L', 1, 22.4, 1),
	new Conversion('mol', 'fu', 1, 6.022e+23, 2),
	new Conversion('mol', 'atom', 1, 6.022e+23, 3),
	new Conversion('in', 'm', 1, 0.0254, 4),
	new Conversion('in', 'ft', 12, 1, 5),
	new Conversion('ft', 'yd', 3, 1, 6),
	new Conversion('yd', 'mi', 1760, 1, 7)
];

var base_conversions = $.extend(true, [], conversions);

var num = conversions[conversions.length - 1].cuid;
for (var i = conversions.length - 1; i >= 0; i--) {
	var hold = conversions[i];
	num++;
	conversions.push(new Conversion(hold.tags[1], hold.tags[0], hold.c_vals[1], hold.c_vals[0], num));
}

var metricPre = [
	{
		name: 'nano',
		symbol: 'n',
		value: 1e-9,
		exp: -9
	},
	{
		name: 'micro',
		symbol: 'u',
		value: 1e-6,
		exp: -6
	},
	{
		name: 'milli',
		symbol: 'm',
		value: 1e-3,
		exp: -3
	},
	{
		name: 'centi',
		symbol: 'c',
		value: 1e-2,
		exp: -2
	},
	{
		name: 'deci',
		symbol: 'd',
		value: 1e-1,
		exp: -1
	},
	{
		name: 'deca',
		symbol: 'da',
		value: 1e+1,
		exp: 1
	},
	{
		name: 'hecto',
		symbol: 'h',
		value: 1e+2,
		exp: 2
	},
	{
		name: 'kilo',
		symbol: 'k',
		value: 1e+3,
		exp: 3
	},
	{
		name: 'mega',
		symbol: 'M',
		value: 1e+6,
		exp: 6
	},
	{
		name: 'giga',
		symbol: 'G',
		value: 1e+9,
		exp: 9
	}
];