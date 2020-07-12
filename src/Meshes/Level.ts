import { Scene, MeshBuilder, PhysicsImpostor, StandardMaterial, AssetsManager, Color3, Texture, Mesh, Vector3 } from "babylonjs";
import { SampleMaterial } from "../Materials/SampleMaterial";

export function createLevel(scene: Scene) {


    const ground = MeshBuilder.CreateBox("ground", { width: 10, height: 0.5, depth: 10 });

    const wallNorth = MeshBuilder.CreateBox("north wall", { width: 10, height: 1, depth: 0.5 });
    wallNorth.position = new Vector3(0, 0.5, 5);

    const wallSouth = MeshBuilder.CreateBox("south wall", { width: 10, height: 1, depth: 0.5 });
    wallSouth.position = new Vector3(0, 0.5, -5);

    const wallEast = MeshBuilder.CreateBox("east wall", { width: 0.5, height: 1, depth: 10 });
    wallEast.position = new Vector3(5, 0.5, 0);

    const wallWest = MeshBuilder.CreateBox("west wall", { width: 0.5, height: 1, depth: 10 });
    wallWest.position = new Vector3(-5, 0.5, 0);

    let walls = [wallNorth, wallSouth, wallEast, wallWest];

    const physicsRoot = new Mesh("ground root", scene);
    physicsRoot.addChild(ground);
    walls.forEach(physicsRoot.addChild);

    ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.6 }, scene);
    walls.forEach(w => w.physicsImpostor = new PhysicsImpostor(w, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.1 }, scene));
    physicsRoot.physicsImpostor = new PhysicsImpostor(physicsRoot, PhysicsImpostor.NoImpostor, { mass: 0, friction: 0.8 }, scene);

    const material = new StandardMaterial("ground", scene)
    ground.material = material
    material.diffuseTexture = new Texture("Textures/Marble062_COL_3K.jpg", scene);
    (material.diffuseTexture as any).uScale = 4;
    (material.diffuseTexture as any).vScale = 4;
    material.bumpTexture = new Texture("Textures/Marble062_NRM_3K.jpg", scene);
    material.roughness = 0.1;

    return ground;
}