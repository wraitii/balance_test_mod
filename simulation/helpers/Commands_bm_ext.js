g_Commands.bm_call = function(player, cmd, data)
{
	if (cmd.component === "DamageMonitor")
	{
		let cmpDamageMonitor = Engine.QueryInterface(SYSTEM_ENTITY, IID_DamageMonitor);
		cmpDamageMonitor[cmd.call]();
	}
};

g_Commands["create-ent"] = function(player, cmd, data)
{
	bm_CreateEntity(cmd);
};


g_Commands.bm_scenario = function(player, cmd, data)
{
	let cmpScenario = Engine.QueryInterface(SYSTEM_ENTITY, IID_bm_Scenario);
	cmpScenario.RunScenario(cmd.scenario, cmd.data);
};
