/**
 * Quickly spawnable units.
 */
var g_QuickSpawn;

class QuickSpawn
{
	static Init()
	{
		g_QuickSpawn = new QuickSpawn();
	}

	static Open()
	{
		Engine.GetGUIObjectByName("bm_quickspawn").hidden = false;
	}

	static Close()
	{
		Engine.GetGUIObjectByName("bm_quickspawn").hidden = true;
	}

	scenarioData()
	{
		return {
			"single_unit": {
				"type": "create-ent",
				"template": "units/athen/infantry_javelineer_b",
				"x": 100,
				"z": 100,
				"owner": 1
			},
			"AvB": {
				"type": "bm_scenario",
				"scenario": "AvB",
				"data": {
					"attackerTemplate": "units/athen/infantry_javelineer_b",
					"defenderTemplate": "units/maur/infantry_archer_b",
					"nbAttacker": 15,
					"nbDefender": 15,
					"range": 30,
				}
			},
			"AAvBB": {
				"type": "bm_scenario",
				"scenario": "AAvBB",
				"data": {
					"melee": {
						"attackerTemplate": "units/athen/infantry_spearman_b",
						"defenderTemplate": "units/maur/infantry_spearman_b",
						"nbAttacker": 5,
						"nbDefender": 5,
						"range": 60,
					},
					"ranged": {
						"attackerTemplate": "units/athen/infantry_javelineer_b",
						"defenderTemplate": "units/maur/infantry_archer_b",
						"nbAttacker": 15,
						"nbDefender": 15,
						"range": 80,
					}
				}
			},
			"DummyFireA": {
				"type": "bm_scenario",
				"scenario": "AvB",
				"data": {
					"attackerTemplate": "units/bm_dummy_target_small",
					"defenderTemplate": "units/maur/infantry_archer_b",
					"nbAttacker": 1,
					"nbDefender": 1,
					"range": 60,
				}
			}
		};
	}

	constructor()
	{
		this.commandInput = Engine.GetGUIObjectByName("bm_sq_input");

		this.scenarios = Engine.GetGUIObjectByName("bm_qs_scenario");
		let scens = this.scenarioData();
		this.scenarios.list = Object.keys(scens);
		this.scenarios.list_data = Object.keys(scens);
		this.scenarios.onSelectionChange = () => {
			if (this.scenarios.selected === -1)
				return;
			this.commandInput.caption = JSON.stringify(this.scenarioData()[this.scenarios.list_data[this.scenarios.selected]], null, 4);
		};
		this.scenarios.selected = 0;
	}

	create()
	{
		Engine.PostNetworkCommand({ "type": "bm_call", "component": "DamageMonitor", "call": "Reset" });
		try { Engine.PostNetworkCommand(JSON.parse(this.commandInput.caption)); } catch(err) { warn(err); };
		QuickSpawn.Close();
	}
}
