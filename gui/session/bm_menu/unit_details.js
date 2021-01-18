/**
 * Quickly spawnable units.
 */
var g_UnitDetails;

class UnitDetails
{
	static Init()
	{
		g_UnitDetails = new UnitDetails();
		UnitDetails.Open();
	}

	static Open()
	{
		Engine.GetGUIObjectByName("bm_unit_details").hidden = false;
		Engine.GetGUIObjectByName("bm_unit_details_button").enabled = false;
	}

	static Close()
	{
		Engine.GetGUIObjectByName("bm_unit_details").hidden = true;
		Engine.GetGUIObjectByName("bm_unit_details_button").enabled = true;
	}

	constructor()
	{
		this.gui = Engine.GetGUIObjectByName("bm_unit_details_list");
		this.presets = Engine.GetGUIObjectByName("bm_ud_presets_list");

		this.loadTemplates();

		this.classFilter = Engine.GetGUIObjectByName("bm_ud_classFilter");
		this.classFilter.onTextEdit = () => {
			this.setupList();
		};

		this.nameFilter = Engine.GetGUIObjectByName("bm_ud_nameFilter");
		this.nameFilter.onTextEdit = () => {
			this.setupList();
		};

		this.stat0Eval = Engine.GetGUIObjectByName("bm_ud_stat0Eval");
		this.stat1Eval = Engine.GetGUIObjectByName("bm_ud_stat1Eval");
		this.stat2Eval = Engine.GetGUIObjectByName("bm_ud_stat2Eval");

		this.createPresets();
		this.choosePreset(3);

		this.stat0Eval.onPress = () => {
			try { this.setupList(); } catch(_) { warn("Code didn't appear to compile: " + _); }
		};
		this.stat1Eval.onPress = () => {
			try { this.setupList(); } catch(_) { warn("Code didn't appear to compile: " + _); }
		};
		this.stat2Eval.onPress = () => {
			try { this.setupList(); } catch(_) { warn("Code didn't appear to compile: " + _); }
		};
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

	createPresets()
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
		this.presets.list = this.preset_data.map(x => x[0]);
		this.presets.list_data = this.preset_data.map(x => x[1]);
		this.presets.onSelectionChange = () => {
			this.choosePreset(this.presets.selected);
		};
		this.presets.onHoverChange = (x) => {
			if (this.presets.hovered === -1)
				this.presets.tooltip = null;
			else
				this.presets.tooltip = this.presets.list_data[this.presets.hovered];
		};
	}

	choosePreset(preset)
	{
		if (this.presets.selected !== preset)
			this.presets.selected = preset;

		this.stat0Eval.caption = this.preset_data[preset][2];
		this.stat1Eval.caption = this.preset_data[preset][3];
		this.stat2Eval.caption = this.preset_data[preset][4];

		this.setupList();
	}

	export()
	{
		let data = {};
		for (let i in this.gui.list)
		{
			data[this.gui.list_template[i]] = {
				"civ": this.gui.list_civ[i],
				[this.stat0Eval.caption]: this.gui.list_stat_0[i],
				[this.stat1Eval.caption]: this.gui.list_stat_1[i],
				[this.stat2Eval.caption]: this.gui.list_stat_2[i],
			};
		}
		Engine.WriteJSONFile("bm_data.json", data);
	}

	///////////

	cleanFloat(x, digits = 1)
	{
		let nb = "" + Number.parseFloat(x || 0).toFixed(digits);
		if (nb.length > 6)
			return "XXXXX";
		nb = coloredText("".padStart(Math.max(0, 5 - nb.length), '_'), 'gray') +
			(nb == 0 ? coloredText(nb, "gray") : nb);
		return nb;
	}

	mainAttack(data)
	{
		return (data?.attack?.Melee || data?.attack?.Ranged ||
			data?.Attack?.Melee || data?.Attack?.Ranged);
	}

	formatDamage(template)
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
	}

	formatRange(template, raw)
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
	}

	formatRate(template)
	{
		let damage = template?.attack?.Melee || template?.attack?.Ranged;
		if (!damage?.Damage)
			return "";
		let ret = "";
		ret += `${this.cleanFloat(damage.repeatTime/1000)}s${coloredText(' / hit', "green")}`;
		return ret;
	}

	formatResistance(template, asEffectiveHP = true)
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
	}

	formatRes(cost)
	{
		if (!cost)
			return "";
		let ret = "";
		ret += `${coloredText('F', "green")}:${this.cleanFloat(cost.food || 0, 0)} - `;
		ret += `${coloredText('W', "green")}:${this.cleanFloat(cost.wood || 0, 0)} - `;
		ret += `${coloredText('M', "green")}:${this.cleanFloat(cost.metal || 0, 0)} - `;
		ret += `${coloredText('S', "green")}:${this.cleanFloat(cost.stone || 0, 0)}`;
		return ret;
	}

	formatTimePop(template)
	{
		if (!template.cost)
			return "";
		let cost = template.cost;

		let ret = "";
		ret += `${coloredText('Time', "green")}:${this.cleanFloat(cost.time || 0, 0)} - `;
		ret += `${coloredText('Pop', "green")}:${this.cleanFloat(cost.population || 0, 0)}`;
		return ret;
	}

	formatGatherRates(template)
	{
		if (!template.resourceGatherRates)
			return "";
		let grate = template.resourceGatherRates;

		let ret = "";
		for (let rate in grate)
			if (rate !== "treasure")
				ret += `${coloredText(rate, "green")}:${this.cleanFloat(grate[rate] || 0, 1)} - `;
		return ret;
	}

	setupList()
	{
		this.gui.selected = -1;
		let names = [];
		let civs = [];
		let stats = [[], [], []];

		for (let tp of Object.keys(this.units))
		{
			try
			{
				if (this.classFilter.caption !== "")
					if (!MatchesClassList(GetIdentityClasses(this.units[tp].raw?.Identity),
						this.classFilter.caption))
						continue;

				if (this.nameFilter.caption !== "")
					if (tp.indexOf(this.nameFilter.caption) === -1)
						continue;
			}
			catch(_) { continue; }
			let template = this.units[tp].template;
			let raw = this.units[tp].raw;

			names.push(tp);
			civs.push(template?.nativeCiv);
			stats[0].push(eval(this.stat0Eval.caption));
			stats[1].push(eval(this.stat1Eval.caption));
			stats[2].push(eval(this.stat2Eval.caption));
		}
		this.gui.list_template = names;
		this.gui.list_civ = civs;
		this.gui.list_stat_0 = stats[0];
		this.gui.list_stat_1 = stats[1];
		this.gui.list_stat_2 = stats[2];
		this.gui.list = names;
	}
}
