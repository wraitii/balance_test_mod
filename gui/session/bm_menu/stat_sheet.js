/**
 * Stat sheets - show statistics in an easy to compare, tabular manner.
 */
var g_StatSheet;

class StatSheet
{
	static Init()
	{
		g_StatSheet = new StatSheet();
	}

	static Open()
	{
		Engine.GetGUIObjectByName("bm_stat_sheet").hidden = false;
	}

	static Close()
	{
		Engine.GetGUIObjectByName("bm_stat_sheet").hidden = true;
	}

	constructor()
	{
		this.gui = Engine.GetGUIObjectByName("bm_stat_sheet_list");
		this.presets = Engine.GetGUIObjectByName("bm_ss_presets_list");

		this.classFilter = Engine.GetGUIObjectByName("bm_ss_classFilter");
		this.classFilter.onTextEdit = () => {
			this.setupList();
		};

		this.nameFilter = Engine.GetGUIObjectByName("bm_ss_nameFilter");
		this.nameFilter.onTextEdit = () => {
			this.setupList();
		};

		this.stat0Eval = Engine.GetGUIObjectByName("bm_ss_stat0Eval");
		this.stat1Eval = Engine.GetGUIObjectByName("bm_ss_stat1Eval");
		this.stat2Eval = Engine.GetGUIObjectByName("bm_ss_stat2Eval");

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

	load(data, presets, filter)
	{
		this.preset_data = presets;
		this.createPresets();
		this.data = data;
		this.setupList();
		this.filter = filter;
	}

	setFilters(nameFilter, classFilter)
	{
		this.nameFilter.caption = nameFilter;
		this.classFilter.caption = classFilter;
		this.setupList();
	}

	createPresets()
	{
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

	setupList()
	{
		this.gui.selected = -1;
		let names = [];
		let civs = [];
		let stats = [[], [], []];

		for (let tp of Object.keys(this.data))
		{
			let template = this.data[tp].template;
			let raw = this.data[tp].raw;

			try
			{
				if (!this.filter(tp, raw, template, this.nameFilter.caption, this.classFilter.caption))
					continue;
			}
			catch(_) { continue; }

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

	///////////////
	// Basic formatters

	cleanFloat(x, digits = 1)
	{
		let nb = "" + Number.parseFloat(x || 0).toFixed(digits);
		if (nb.length > 6)
			return "XXXXX";
		nb = coloredText("".padStart(Math.max(0, 5 - nb.length), '_'), 'gray') +
			(nb == 0 ? coloredText(nb, "gray") : nb);
		return nb;
	}
}
