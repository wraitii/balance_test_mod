function DamageMonitor() {}

DamageMonitor.prototype.Schema =
	"<a:component type='system'/><empty/>";

DamageMonitor.prototype.Init = function()
{
	this.meta = {};
	this.damageDealt = {};
	this.damageTaken = {};
	/*
	let HAE = Attacking.HandleAttackEffects.bind(Attacking);
	Attacking.HandleAttackEffects = function(target, attackType, attackData, attacker, attackerOwner, bonusMultiplier = 1)
	{
		warn("monitored attack " + uneval(attackData));
		return HAE(target, attackType, attackData, attacker, attackerOwner, bonusMultiplier);
	};*/
};

DamageMonitor.prototype.OnGlobalOwnershipChanged = function(msg)
{
	if (msg.from !== -1)
		return;

	if (!(msg.entity in this.meta))
		this.meta[msg.entity] = {};

	let cmpTemplateManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager);
	this.meta[msg.entity].template = cmpTemplateManager.GetCurrentTemplateName(msg.entity);

	this.meta[msg.entity].oldIDs = [];

	let cmpOwnership = Engine.QueryInterface(msg.entity, IID_Ownership);
	if (cmpOwnership)
		this.meta[msg.entity].owner = cmpOwnership.GetOwner();
	else
		this.meta[msg.entity].owner = -1;
};

DamageMonitor.prototype.OnGlobalEntityRenamed = function(msg)
{
	if (!(msg.entity in this.meta))
		return;

	this.meta[msg.newentity] = this.meta[msg.entity];
	this.meta[msg.newentity].oldIDs.push(msg.entity);

	this.damageDealt[msg.newentity] = this.damageDealt[msg.entity];
	this.damageTaken[msg.newentity] = this.damageTaken[msg.entity];
	delete this.damageDealt[msg.entity];
	delete this.damageTaken[msg.entity];
};

DamageMonitor.prototype.OnGlobalAttacked = function(msg)
{
	if (!(msg.attacker in this.damageDealt))
	{
		this.damageDealt[msg.attacker] = 0;
	}

	if (!(msg.target in this.damageTaken))
	{
		this.damageTaken[msg.target] = 0;
	}

	this.damageDealt[msg.attacker] += msg.damage;
	this.damageTaken[msg.target] += msg.damage;
};

DamageMonitor.prototype.Reset = function()
{
	this.Init();
};

DamageMonitor.prototype.Print = function()
{
	let dealtPerTemplate = {};
	let takenPerTemplate = {};
	for (let ent in this.damageTaken)
	{
		if (!(this.meta[ent].template in takenPerTemplate))
		{
			dealtPerTemplate[this.meta[ent].template] = [0, 0];
			takenPerTemplate[this.meta[ent].template] = [0, 0];
		}
		dealtPerTemplate[this.meta[ent].template][0] += this.damageDealt[ent] || 0;
		dealtPerTemplate[this.meta[ent].template][1]++;
		takenPerTemplate[this.meta[ent].template][0] += this.damageTaken[ent] || 0;
		takenPerTemplate[this.meta[ent].template][1]++;
	}
	for (let t in dealtPerTemplate)
		dealtPerTemplate[t][0] /= dealtPerTemplate[t][1];
	for (let t in takenPerTemplate)
		takenPerTemplate[t][0] /= takenPerTemplate[t][1];
	for (let t in dealtPerTemplate)
		warn(`Template ${t}: ${dealtPerTemplate[t][0]} dealt, ${takenPerTemplate[t][0]} taken`);
};


Engine.RegisterSystemComponentType(IID_DamageMonitor, "DamageMonitor", DamageMonitor);
