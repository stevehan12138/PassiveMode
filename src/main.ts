const sys = server.registerSystem(0, 0);

sys.initialize = function (){
    server.log("passive mode by Fjun loaded");
    sys.registerComponent("passivemode:flag", {flag:false});

    sys.listenForEvent("minecraft:entity_created",eventData=>{

        let player = eventData.data.entity;
        if(player.__identifier__ == "minecraft:player"){
            if(!sys.hasComponent(player, "passivemode:flag")) sys.createComponent(player, "passivemode:flag");
        }
    });

    sys.registerCommand("passive",{
        description: "控制被动模式",
        permission: 0,
        overloads:[
            {
                parameters: [
                {
                    name:"控制",
                    type:"bool"
                }
                    ],
                handler([flag]){
                    const player = this.entity
                    if(!player || player.__identifier__ != "minecraft:player") throw `Can only be used by player`;
                    let playerflag = sys.getComponent<IPassiveFlag>(player, "passivemode:flag");
                    playerflag.data.flag = flag;
                    sys.applyComponentChanges(player, playerflag);
                    return "设置成功";
                }
            } as CommandOverload<["bool"]>
        ]
    });

    sys.handlePolicy(MinecraftPolicy.PlayerAttackEntity, data=>{
        try{
            let attacker = data.player;
            let victim = data.target;
            if(victim.__identifier__ == "minecraft:player" && attacker.__identifier__ == "minecraft:player"){
                let attackerflag = sys.getComponent<IPassiveFlag>(attacker, "passivemode:flag");
                let victimflag = sys.getComponent<IPassiveFlag>(victim, "passivemode:flag");
                if(attackerflag.data.flag || victimflag.data.flag){
                    sys.sendText(attacker, "对方或你开启了被动模式，你无法攻击ta");
                    return false;
                }
            }
            return true;
        }
        catch(error){
            server.log("拦截攻击出错");
        }
    })
}

interface IPassiveFlag{
    flag: boolean;
}