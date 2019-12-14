# Introduction
This repo contains webGL Three.js based interface demos for interactions with 3d data using mouse and touch

# 01 mouse hover on mesh
[01 mouse hover on mesh - demo directory](./01_mesh_mouse_on_hover)
## Gif Demo

<img src="./01_mesh_mouse_on_hover/media/demo.gif" width="600">

The user moves the mouse over the sphere object which changes color on enter and on exit events.

## Design

<img src="./01_mesh_mouse_on_hover/media/design.png" width="600">

This mouse hover example is easily reusable as it is split in modules. The "three_mouse.js" contains the conversion logic from the web mouse events to the 3D mouse mesh events. It is isolated from the main application logic in "main.js", and both isolated from the "three_app.js" which contains clasical three environment and shapes creation.
* On init : The user is only supposed to know the names of the created obejcts in the the three scene, and passes a list of names to get back a list of meshes with `three.getObjects()`.
  
  This list is then provided to the "three_mouse.js" module.
* On event, the "three_mouse.js" triggers events on mouse entering the mesh and exit from the mesh. These events provide the name of the mesh. The name can be used to call a "three_app.js" function that sets the state according to the event, in this demo the emissive color is changing.
