# Exploring event data

As described in the section on [How To: Exploring Event Data](https://github.com/ashtipliyski/cms-threejs-event-display/wiki/How-To:-Loading-Data) the current data structure representing event data is focused around the reconstructed (and fitted) particle track objects. The user interface (UI) implemented to explore the contents of these data files is also built with focus on those particle candidates.

This page describes the different UI panels available to the user for exploring the data file contents, while providing a basic guide to how these panels might be best used.

## Using candidates data table

The main component of the UI holding information about the event is the is the *Candidates List* data table located in on the right side of the screen and can be found under the Event top-level section of the navigation. It lists the candidates contained in the currently selected event from the loaded data file as rows in a table and shows the properties of those candidates in separate columns. The currently listed candidate properties are:

- **#**: Object ID as the order of the object in the data file
- **p<sub>T</sub>**: Transverse momentum of candidate measured in GeV/c
- **q**: Electric charge of candidate, measured in units of elementary charge, e
- **&eta;**: Pseudo-rapidity of candidate
- **&phi;<sub>0</sub>**: Initial azimuthal angle of the particle
- **S<sub>&phi;</sub>**: &phi; segment of the detector to which the candidate is assigned
- **R<sub>&eta;</sub>**: &eta region of the detector to which the candidate is assigned

The data table supports sorting by any of those properties which can be done by clicking on the column heading and ordering can be changed by multiple clicks.

As part of the event data description format, a single *true particle* is often assigned to each candidate. The kinematic properties of the particle can be seen by hovering over the candidate entry in the table which will cause a black pop-over containing the relevant information appear on the side of the table. However, since not all reconstructed candidates will have a corresponding true particle the table provides a visual indication of these candidates by highlighting their entry in red.

The data table can also be used for highlighting or selecting candidates by responding to click and hover mouse events. When the user moves their mouse over a given candidate, its track in the 3D scene will change colour to red which signifies *highlight* action. If the user is to click on a candidate, this will *select* it, changing the colour of track to purple and adding the event objects associated with the candidate to the 3D scene. Each candidate will have a set of associated stubs which are visualised as solid spheres which can be coloured either red or black, representing fake and genuine stubs respectively. In case a true particle is associated with the candidate, it will be added to the scene and visualised as a green track.

## Navigating 3D Scene

The 3D scene is where the event data and detector geometry are visualised in. It occupies the left side of the application window and has been configured to automatically adjust to occupy all the available screen space provided by the browser/application window. Technologically, the rendering of 3D objects is accomplished using the Three.js library which in turn is build on the WebGL browser technology. The usage of WebGl allows for the application to delegate the rendering of 3D objects to the graphics card of the user's computer which delivers significantly improved performance when compared to implementations only using the computer's CPU.

The 3D is equipped with *trackball* controls which allow for the control of the orientation (view) of the virtual camera looking at the scene with objects. The camera can be rotated around the focus point by clicking and dragging on the scene with the left button of the mouse. By panning the user can change the focus point (where the camera looks) can be achieved by clicking and dragging on the scene with the right button of the mouse. Zoom is facilitated via the mouse wheel (or the button controls under Geometry &rarr; View Controls). To aid the navigation while rotating the camera and identifying the orientation of the visible objects, the scene is provided with an inset coordinate system in the lower left corner that is synchronised with the original/big scene.

Additional camera controls are provided in the form of buttons under the Geometry section of the top-level menu. These allow for four different types of operations including:

- Orientation
- Zoom
- Camera rotation/pan
- Camera type

The orientation controls allow for the camera to be instantly set to a specific position so as to give a particularly useful view of the scene and the objects rendered on it. The currently implemented views are of the xy, xz and yz planes.

The zoom controls change the visible size of objects on the scene by changing the magnification with which they are rendered. These controls duplicate the functionality provided by the mouse wheel when using the Perspective Camera

The pan/rotate controls are particularly useful when the user wants to change the orientation/position of the camera in pre-defined increments without interacting with the assets currently visualised on the scene. An example of such case is when using the mouse to change the view might highlight/select assets from the scene.

The application can render objects on the scene under two different regimes using Orthographic and Perspective projections respectively. The two visualise the objects on the scene slightly differently which makes them more useful in different scenarios. The Perspective projection is good for navigating through the event topology using rotations and panning where the goal of the user is to build an idea of the overall distribution of event components (tracks) in 3D space. The Orthographic projection on the other hand flattens the scene contents and is particularly useful when the user wants to study the event data in R-&phi; or R-z projections. The navigation in this projection is somewhat limited and is recommended to mainly use the predefined orientations and zoom controls in the section *View Controls* of the UI.

## Focus Information panel

The Focus Information panel is located in the lower left corner of the application window and holds information about the currently selected or highlighted event candidate. It was envisioned as a location in the UI where the information of the selected event element is permanently shown, regardless of the state of the data table. The currently displayed information is:

- **track ID**: Unique identifier of the candidate
- **p<sub>T</sub>**: Transverse momentum of candidate in GeV/c
- **&phi;<sub>0</sub>**: Initial azimuthal angle of candidate
- **&eta;**: Pseudo-rapidity of the candidate
- **&chi;<sup>2</sup><sub>red</sub>**: Reduced &chi;<sup>2</sup> (goodness of fit) parameter for reconstructed candidate
- **n<sub>p</sub>**: Number of points used to generate the trajectory

## Applying data cuts

In order to help the user focus their attention only on subset of the event contents, the visualiser is equipped with a tool for applying cuts on the properties of the objects in the currently loaded event. This is provided by the *Data Cuts* panel accessible from *Event &rarr; Data cuts*. Currently the panel allows to specify the kinematic properties of the candidate, such as *p<sub>T</sub>, &eta;, N<sub>stubs</sub>, R<sub>&eta;</sub>, S<sub>&phi;</sub>* and whether the candidate has a corresponding true particle. In the cases when an associated TP exists, it is also possible to set constraints on its *p<sub>T</sub>* and *&eta;*.

Once the cut requirements have been specified, the user use the *Apply Cuts* button at the bottom of the panel which make the visualiser show only the candidates that meet the criteria of the specified cut.

## Changing visibility of event elements

Each of the elements (rows) of the candidate data table contains a checkbox that can be used to toggle the visibility of the corresponding candidate. As described above, the Data Cuts panel can also be used to change the visibility of event candidates in bulk. Additionally to those, the *Hide All* and *Show All* buttons below the data table can be used to hide or show all candidates in the current event. If the user is interested in seeing only the objects corresponding to the currently selected candidate, the *Show Selected* can be used to hide all other candidates.
