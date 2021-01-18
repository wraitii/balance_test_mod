/**
 * Quickly spawnable units.
 */
var g_UnitDetails;

class UnitDetails
{
	static init()
	{
		g_UnitDetails = new UnitDetails();
	}

	constructor()
	{
		this.gui = Engine.GetGUIObjectByName("unit_details_list");
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

		this.classFilter = Engine.GetGUIObjectByName("classFilter");
		this.classFilter.onTextEdit = () => {
			this.setupList();
		};

		this.nameFilter = Engine.GetGUIObjectByName("nameFilter");
		this.nameFilter.onTextEdit = () => {
			this.setupList();
		};

		this.stat0Eval = Engine.GetGUIObjectByName("stat0Eval");
		this.stat1Eval = Engine.GetGUIObjectByName("stat1Eval");
		this.stat2Eval = Engine.GetGUIObjectByName("stat2Eval");

		this.stat0Eval.caption = "template?.health";
		this.stat1Eval.caption = "this.formatResistance(template)";
		this.stat2Eval.caption = "this.formatDamage(template)";

		this.stat0Eval.onPress = () => {
			try { this.setupList(); } catch(_) { warn("Code didn't appear to compile: " + _); };
		}
		this.stat1Eval.onPress = () => {
			try { this.setupList(); } catch(_) { warn("Code didn't appear to compile: " + _); };
		}
		this.stat2Eval.onPress = () => {
			try { this.setupList(); } catch(_) { warn("Code didn't appear to compile: " + _); };
		}

		this.setupList();
	}

	cleanFloat(x, digits = 1)
	{
		let nb = "" + Number.parseFloat(x || 0).toFixed(digits);
		if (nb.length > 6)
			return "XXXXX";
		nb = coloredText("".padStart(Math.max(0, 5 - nb.length), '_'), 'gray') +
			(nb == 0 ? coloredText(nb, "gray") : nb);
		return nb;
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
