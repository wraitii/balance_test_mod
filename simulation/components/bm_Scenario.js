function bm_Scenario() {}

bm_Scenario.prototype.Schema =
	"<a:component type='system'/><empty/>";

bm_Scenario.prototype.Init = function()
{
	this.activeScenario = null;

	this.Scenarios = {
		"AvB": data =>
		{
			let attackerTemplate = data.attackerTemplate;
			let defenderTemplate = data.defenderTemplate;
			let nbAttacker = data.nbAttacker || 5;
			let nbDefender = data.nbDefender || 5;
			let range = data.range || 40;
			let randomness = data.randomness || 1;
			let x = data.x || 100;
			let z = data.z || 100;
			let attackers = [];
			let defenders = [];
			for (let i = 0; i < nbAttacker; ++i)
				attackers.push(bm_CreateEntity({
					"template": attackerTemplate,
					"x": x + i * 2 - nbAttacker + randFloat(-randomness, randomness),
					"z": z - range / 2 + randFloat(-randomness, randomness),
					"owner": 2
				}));
			for (let i = 0; i < nbDefender; ++i)
				defenders.push(bm_CreateEntity({
					"template": defenderTemplate,
					"x": x + i * 2 - nbAttacker + randFloat(-randomness, randomness),
					"z": z + range / 2 + randFloat(-randomness, randomness),
					"owner": 3
				}));
			return [attackers, defenders];
		},
		"AAvBB": data =>
		{
			let [attackers, defenders] = this.Scenarios.AvB(data.ranged);
			let [attackers2, defenders2] = this.Scenarios.AvB(data.melee);
			return [attackers.concat(attackers2), defenders.concat(defenders2)];
		},
		"n_AvB": data =>
		{
			let [attackers, defenders] = [[], []];
			for (let i in data)
			{
				let [att, def] = this.Scenarios.AvB(data[i]);
				attackers = attackers.concat(att);
				defenders = defenders.concat(def);
			}
			return [attackers, defenders];
		}
	};
};

bm_Scenario.prototype.Serialize = function()
{
	return this.activeScenario;
};

bm_Scenario.prototype.Deserialize = function(data)
{
	this.activeScenario = data;
};

bm_Scenario.prototype.KillActiveScenario = function()
{
	if (!this.activeScenario || !this.activeScenario.attackers)
		return;
	for (let attacker of this.activeScenario.attackers)
	{
		let cmpPos = Engine.QueryInterface(attacker, IID_Position);
		if (cmpPos)
			cmpPos.MoveOutOfWorld();
		Engine.DestroyEntity(attacker);
	}
	for (let defender of this.activeScenario.defenders)
	{
		let cmpPos = Engine.QueryInterface(defender, IID_Position);
		if (cmpPos)
			cmpPos.MoveOutOfWorld();
		Engine.DestroyEntity(defender);
	}
	this.activeScenario = undefined;
};

bm_Scenario.prototype.RunScenario = function(scenario, data)
{
	if (!!this.activeScenario)
		this.KillActiveScenario();

	let cmpDamageMonitor = Engine.QueryInterface(SYSTEM_ENTITY, IID_DamageMonitor);
	cmpDamageMonitor.Reset();

	this.activeScenario = {};
	let [att, def] = this.Scenarios[scenario](data);
	this.activeScenario.attackers = att;
	this.activeScenario.defenders = def;

	let cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	this.scenarioStart = cmpTimer.GetTime();
};

bm_Scenario.prototype.OnGlobalEntityRenamed = function(msg)
{
	if (!this.activeScenario)
		return;
	if (this.activeScenario.attackers.indexOf(msg.entity) !== -1)
		this.activeScenario.attackers.splice(this.activeScenario.attackers.indexOf(msg.entity), 1, msg.newentity);
	else if (this.activeScenario.defenders.indexOf(msg.entity) !== -1)
		this.activeScenario.defenders.splice(this.activeScenario.defenders.indexOf(msg.entity), 1, msg.newentity);
};


bm_Scenario.prototype.OnGlobalOwnershipChanged = function(msg)
{
	if (msg.to !== -1 || !this.activeScenario)
		return;

	let ref;
	if (this.activeScenario.attackers.indexOf(msg.entity) !== -1)
		ref = this.activeScenario.attackers;
	else if (this.activeScenario.defenders.indexOf(msg.entity) !== -1)
		ref = this.activeScenario.defenders;

	if (!ref)
		return;

	ref.splice(ref.indexOf(msg.entity), 1);

	if (ref.length)
		return;

	let cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	let time = cmpTimer.GetTime();

	// One side won.
	warn(`Scenario done in ${(time - this.scenarioStart)/1000}s`);

	let cmpDamageMonitor = Engine.QueryInterface(SYSTEM_ENTITY, IID_DamageMonitor);
	cmpDamageMonitor.Print();
};

Engine.RegisterSystemComponentType(IID_bm_Scenario, "bm_Scenario", bm_Scenario);
