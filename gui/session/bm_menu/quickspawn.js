/**
 * Quickly spawnable units.
 */
var g_QuickSpawn;

class QuickSpawn
{
	static init()
	{
		g_QuickSpawn = new QuickSpawn();
	}

	constructor()
	{
		this.gui = Engine.GetGUIObjectByName("quickspawn_list");
		this.units = {};
	}

	setupList()
	{

	}
}
