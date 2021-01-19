StatSheet.prototype.mainAttack = function(data)
{
	return (data?.attack?.Melee || data?.attack?.Ranged ||
		data?.Attack?.Melee || data?.Attack?.Ranged);
};

StatSheet.prototype.formatDamage = function(template)
{
	let damage = template?.attack?.Melee || template?.attack?.Ranged;

	if (!damage?.Damage || !damage?.repeatTime)
		return "";
	let ret = "";

	ret += `${coloredText('H', "green")}:${this.cleanFloat(damage.Damage.Hack / damage.repeatTime * 1000)} - `;
	ret += `${coloredText('P', "green")}:${this.cleanFloat(damage.Damage.Pierce / damage.repeatTime * 1000)} - `;
	ret += `${coloredText('C', "green")}:${this.cleanFloat(damage.Damage.Crush / damage.repeatTime * 1000)} - `;
	ret += `${coloredText('T', "green")}:${this.cleanFloat((damage.Damage.Hack + damage.Damage.Pierce + damage.Damage.Crush) / damage.repeatTime * 1000)} - `;

	return ret;
};

StatSheet.prototype.formatRange = function(template, raw)
{
	let damage = template?.attack?.Melee || template?.attack?.Ranged;
	if (!damage?.Damage)
		return "";
	let ret = "";
	ret += `${coloredText('range', "green")}: ${this.cleanFloat(damage.minRange)} - `;
	ret += `${this.cleanFloat(damage.maxRange)}`;
	if (template?.attack?.Ranged)
	{
		let spread = raw.Attack?.Ranged?.Projectile?.Spread || 0;
		ret += `, ${coloredText('spread', "green")}: ${this.cleanFloat(spread)}% / ${this.cleanFloat(spread / 100 * damage.maxRange)}`;
	}
	return ret;
};

StatSheet.prototype.formatRate = function(template)
{
	let damage = template?.attack?.Melee || template?.attack?.Ranged;
	if (!damage?.Damage)
		return "";
	let ret = "";
	ret += `${this.cleanFloat(damage.repeatTime/1000)}s${coloredText(' / hit', "green")}`;
	return ret;
};

StatSheet.prototype.formatResistance = function(template, asEffectiveHP = true)
{
	let res = template?.resistance?.Damage;
	if (!res)
		return "";
	let ret = "";
	let mul = x => x;
	if (asEffectiveHP && template?.health)
		mul = x => template.health / Math.pow(0.9, x);
	ret += `${coloredText('H', "green")}:${this.cleanFloat(mul(res.Hack), 0)} - `;
	ret += `${coloredText('P', "green")}:${this.cleanFloat(mul(res.Pierce), 0)} - `;
	ret += `${coloredText('C', "green")}:${this.cleanFloat(mul(res.Crush), 0)}`;

	return ret;
};

StatSheet.prototype.formatRes = function(cost)
{
	if (!cost)
		return "";
	let ret = "";
	ret += `${coloredText('F', "green")}:${this.cleanFloat(cost.food || 0, 0)} - `;
	ret += `${coloredText('W', "green")}:${this.cleanFloat(cost.wood || 0, 0)} - `;
	ret += `${coloredText('M', "green")}:${this.cleanFloat(cost.metal || 0, 0)} - `;
	ret += `${coloredText('S', "green")}:${this.cleanFloat(cost.stone || 0, 0)}`;
	return ret;
};

StatSheet.prototype.formatTimePop = function(template)
{
	if (!template.cost)
		return "";
	let cost = template.cost;

	let ret = "";
	ret += `${coloredText('Time', "green")}:${this.cleanFloat(cost.time || 0, 0)} - `;
	ret += `${coloredText('Pop', "green")}:${this.cleanFloat(cost.population || 0, 0)}`;
	return ret;
};

StatSheet.prototype.formatGatherRates = function(template)
{
	if (!template.resourceGatherRates)
		return "";
	let grate = template.resourceGatherRates;

	let ret = "";
	for (let rate in grate)
		if (rate !== "treasure")
			ret += `${coloredText(rate, "green")}:${this.cleanFloat(grate[rate] || 0, 1)} - `;
	return ret;
};
