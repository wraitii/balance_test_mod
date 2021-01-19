var bm_CreateEntity = function(data)
{
	let ent = Engine.AddEntity(data.template);
	if (data.x)
	{
		let cmpPosition = Engine.QueryInterface(ent, IID_Position);
		cmpPosition.JumpTo(data.x, data.z);
	}

	if (data.owner)
	{
		let cmpOwnership = Engine.QueryInterface(ent, IID_Ownership);
		cmpOwnership.SetOwner(data.owner);
	}
	return ent;
};

Engine.RegisterGlobal("bm_CreateEntity", bm_CreateEntity);
