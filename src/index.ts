const OIMO = require("oimo");
import "babylonjs-loaders"
import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, Vector3, SceneLoader, CannonJSPlugin, PhysicsImpostor, Mesh, AbstractMesh, ArcFollowCamera, ActionManager, ExecuteCodeAction, OimoJSPlugin } from "babylonjs"
import { SampleMaterial } from "./Materials/SampleMaterial"
import { createLevel } from "./Meshes/Level"

async function main() {
    const gravity = new Vector3(0, -9.8, 0);
    const physicsPlugin = new OimoJSPlugin(null, OIMO);

    const view = document.getElementById("view") as HTMLCanvasElement
    const engine = new Engine(view, true)

    const scene = new Scene(engine)
    scene.enablePhysics(gravity, physicsPlugin);

    const light = new HemisphericLight(
        "light",
        new Vector3(0, 1, 0),
        scene)

    let result = await SceneLoader.ImportMeshAsync(null, "./Models/", "GolfBall.glb", scene);

    let ball = result.meshes[0]

    let physicsRoot = new Mesh("", scene);
    let ballCollider = MeshBuilder.CreateSphere("sphereCollider", { diameter: 0.043 }, scene);
    ballCollider.isVisible = false;
    physicsRoot.addChild(ball);
    physicsRoot.addChild(ballCollider);
    physicsRoot.position.y = 1;
    physicsRoot.scaling = new Vector3(4, 4, 4);

    ballCollider.physicsImpostor = new PhysicsImpostor(ballCollider, PhysicsImpostor.SphereImpostor, { mass: 0 }, scene);
    physicsRoot.physicsImpostor = new PhysicsImpostor(physicsRoot, PhysicsImpostor.NoImpostor, { mass: 1, restitution: 1 }, scene);
    physicsRoot.physicsImpostor.physicsBody.linearDamping = 0.9;

    const followCam = new ArcFollowCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 1.2,
        2,
        physicsRoot,
        scene)

    followCam.attachControl(view)

    const forceMultiplier = 20;
    let forceDirection: Vector3 = Vector3.Zero();

    scene.actionManager = new ActionManager(scene);
    scene.pointerMovePredicate

    const deltas = {
        "w": new Vector3(0, 0, 1),
        "s": new Vector3(0, 0, -1),
        "a": new Vector3(-1, 0, 0),
        "d": new Vector3(1, 0, 0),
    };

    const states = {
        "w": false,
        "s": false,
        "a": false,
        "d": false
    }

    scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, evt => {
        let key: string = evt.sourceEvent.key;
        key = key.toLowerCase();

        var delta = deltas[key];
        if (delta && !states[key]) {
            states[key] = true;
            forceDirection.addInPlace(delta);
            console.log(`f=${forceDirection}`);
        }
    }));

    scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, evt => {
        let key: string = evt.sourceEvent.key;
        key = key.toLowerCase();

        var delta = deltas[key];
        if (delta) {
            states[key] = false;
            forceDirection.subtractInPlace(delta);
            console.log(`f=${forceDirection}`);
        }
    }));

    scene.registerBeforeRender(() => {
        if (forceDirection.lengthSquared() > 0.1)
        {
            // What's "2000" you ask? I dunno
            let impulse = forceDirection.scale(scene.deltaTime / 2000);
            physicsRoot.physicsImpostor.applyImpulse(impulse.scale(forceMultiplier), physicsRoot.getAbsolutePosition());
        }
    });

    scene.onBeforeRenderObservable.add(() => {
        // OIMO doesn't support linear damping. So y'know, do it myself.
        physicsRoot.physicsImpostor.setAngularVelocity(physicsRoot.physicsImpostor.getAngularVelocity().scale(.5));
    })

    createLevel(scene)

    engine.runRenderLoop(() => {
        scene.render();
    })
}
main();