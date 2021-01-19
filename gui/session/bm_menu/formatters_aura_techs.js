
StatSheet.prototype.formatModifications = function(raw)
{
	if (!raw.modifications)
		return "";
	return raw.modifications.map(mod => {
		return `${coloredText(mod.value, mod.affects ? "orange" : "green")}: ${mod.add || mod.multiply || mod.tokens || mod.replace}`;
	}).join('\n');
};

StatSheet.prototype.formatModification = function(raw, modname)
{
	if (!raw.modifications)
		return "";
	let mods = raw.modifications.filter(x => x.value.indexOf(modname) !== -1);
	if (!mods.length)
		return "";
	return mods.map(mod => {
		return `${coloredText(mod.value, mod.affects ? "orange" : "green")}: ${mod.add || mod.multiply || mod.tokens || mod.replace}`;
	}).join('\n');
};


StatSheet.prototype.formatRequirements = function(raw)
{
	let reqs = DeriveTechnologyRequirements(raw)?.[0];
	if (!reqs)
		return "";
	let ret = `${coloredText("Techs", "green")}: ${reqs?.techs?.join(', ')}`;
	if (Object.keys(reqs).some(x => x !== "techs"))
		ret += ' and others.';
	return ret;
};
