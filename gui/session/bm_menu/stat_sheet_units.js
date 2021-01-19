/**
 * Load unit template data onto the stat sheet.
 */
var g_StatSheetUnits;
class StatSheetUnits
{
	static Init()
	{
		g_StatSheetUnits = new StatSheetUnits();
		StatSheetUnits.Open();
	}

	static Open()
	{
		g_StatSheet.load(g_StatSheetUnits.units,
			g_StatSheetUnits.preset_data,
			g_StatSheetUnits.filter);
		g_StatSheet.setFilters("template_", "Unit");
		g_StatSheet.choosePreset(0);
		StatSheet.Open();
	}

	constructor()
	{
		this.preset_data = [
			[
				"Unit Stats",
				"Core unit stats: HP, resistance, DPS",
				"template?.health",
				"this.formatResistance(template)",
				"this.formatDamage(template)",
			],
			[
				"Unit Stats (2)",
				"Cost, DPS",
				"this.formatRes(template.cost)",
				"this.formatTimePop(template)",
				"this.formatDamage(template)",
			],
			[
				"Attack details",
				"",
				"this.formatDamage(template)",
				"this.formatRange(template, raw)",
				"this.formatRate(template)",
			],
			[
				"Attack details (2)",
				"",
				"this.mainAttack(raw)?.AttackName?._string || this.mainAttack(raw)?.AttackName || ''",
				"this.mainAttack(raw)?.PreferredClasses?._string || ''",
				"this.mainAttack(raw)?.RestrictedClasses?._string || ''",
			],

			[
				"Unit Classes",
				"Class / Footprint / Auras",
				"GetIdentityClasses(raw?.Identity).join(', ')",
				"uneval(template?.footprint)",
				"raw?.Auras?._string || ''",
			],
			[
				"Cost",
				"Costs / Pop",
				"this.formatRes(template.cost)",
				"this.formatTimePop(template)",
				"this.formatRes(template.loot)",
			],
			[
				"Queues",
				"Builder / Production queues",
				"raw?.Builder?.Entities?._string?.split(' ')?.map(x => x.replace('structures/', ''))?.join(', ') || ''",
				"raw?.ProductionQueue?.Entities?._string?.split(' ')?.map(x => x.replace('units/', ''))?.join(', ') || ''",
				"raw?.ProductionQueue?.Technologies?._string?.split(' ')?.join(', ') || ''",
			],
			[
				"Resource Gatherer",
				"Gatherer Rates",
				"raw?.ResourceGatherer?.MaxDistance || ''",
				"this.formatGatherRates(template)",
				"''",
			],
			[
				"Garrison",
				"Holder, ...",
				"template?.garrisonHolder?.capacity || ''",
				"raw?.GarrisonHolder?.List?._string || ''",
				"''",
			],
		];
		this.loadTemplates();
	}

	loadTemplates()
	{
		this.units = {};
		for (let template of Engine.ListDirectoryFiles("simulation/templates/", "*.xml", true))
		{
			let tp = template.replace("simulation/templates/", "").replace(".xml", "");
			if (tp.indexOf("special") !== -1)
				continue;
			try
			{
				let temp = Engine.GetTemplate(tp);
				this.units[tp] = {
					"raw": temp,
					"template": GetTemplateDataHelper(temp)
				};
			}
			catch(err) {
				//warn("Err : " + tp + " - " + err);
			}
		}
	}

	filter(tp, raw, template, nameFilter, classFilter)
	{
		if (classFilter !== "")
			if (!MatchesClassList(GetIdentityClasses(raw?.Identity), classFilter))
				return false;

		if (nameFilter !== "")
			if (tp.indexOf(nameFilter) === -1)
				return false;
		return true;
	}
}
