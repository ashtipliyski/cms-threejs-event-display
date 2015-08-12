#!/usr/bin/env python2

"""
This version of the code generates all modules arranged 
tangential to the barrel but at different radial separation
"""

import matplotlib.pyplot as plt;
from mpl_toolkits.mplot3d import Axes3D
import numpy as np;


fig_size = 7;
points_num = 20;
radius = 100;   # radius of barrel
length = 40; # module length
width = 5  # module thickness
thickness = 8;
z_spacing = 2;
module_rotation = 0 # alpha, rotation of modules in degrees
module_rotation = module_rotation * np.pi/180;



fig = plt.figure(figsize=(fig_size, fig_size))
ax = fig.add_subplot(111, projection='3d')
plt.grid();

def generate_module_pos(n, r, w, l, a):
    indentation_r = 0.08

    modules = [{}] * n;
    
    for i in range(0, n):
        if i % 2 == 0:
            indent = True;
            extra_r = 0;
        else: 
            indent = False;
            extra_r = indentation_r
        
        theta = 2 * np.pi * i/n;
        x = r * np.cos(theta);
        y = r * np.sin(theta);
    
        theta_r = np.pi/2 - theta; # rotated theta
        cos_th = np.cos(theta)
        sin_th = np.sin(theta)
    
        r_x = r * (1 + extra_r) * cos_th    
        r_y = r * (1 + extra_r) * sin_th
    
        # r hat cartesian components
        r_hat_x = np.cos(a) * cos_th - np.sin(a) * sin_th
        r_hat_y = np.sin(a) * cos_th + np.cos(a) * sin_th
    
        # theta hat cartesian components
        t_hat_x = -np.cos(a) * sin_th - np.sin(a) * cos_th
        t_hat_y = -np.sin(a) * sin_th + np.cos(a) * cos_th
    
        # equations accounting for module rotation
        x_vect = [
            r_x + 0.5 * l * t_hat_x - 0.5 * w * r_hat_x, # r1
            r_x + 0.5 * l * t_hat_x + 0.5 * w * r_hat_x,  # r2
            r_x - 0.5 * l * t_hat_x + 0.5 * w * r_hat_x, # r3
            r_x - 0.5 * l * t_hat_x - 0.5 * w * r_hat_x # r4
        ]
    
        y_vect = [
            r_y + 0.5 * l * t_hat_y - 0.5 * w * r_hat_y, # r1
            r_y + 0.5 * l * t_hat_y + 0.5 * w * r_hat_y,  # r2
            r_y - 0.5 * l * t_hat_y + 0.5 * w * r_hat_y, # r3
            r_y - 0.5 * l * t_hat_y - 0.5 * w * r_hat_y # r4
        ]

        modules[i] = {"x": x_vect, "y": y_vect};
        
    return modules;

gen_mods= generate_module_pos(points_num, radius, width, length, module_rotation);

modules_num = 20;
z = 0

# blocks = [{}] * modules_num;
blocks = [];
for z in range(0, modules_num):
    for j in range(0, len(gen_mods)):


        block = {
            "x": [
                gen_mods[j]['x'][0], 
                gen_mods[j]['x'][1], 
                gen_mods[j]['x'][2],
                gen_mods[j]['x'][3], 
                gen_mods[j]['x'][0],  
                gen_mods[j]['x'][1], 
                gen_mods[j]['x'][2],
                gen_mods[j]['x'][3]  
                
            ], #gen_mods[j]['x'] + gen_mods[j]['x'],
            "y": [
                gen_mods[j]['y'][0], 
                gen_mods[j]['y'][1], 
                gen_mods[j]['y'][2],
                gen_mods[j]['y'][3], 
                gen_mods[j]['y'][0],  
                gen_mods[j]['y'][1], 
                gen_mods[j]['y'][2],
                gen_mods[j]['y'][3]
            ], #gen_mods[j]['y'] + gen_mods[j]['y'],
            "z": [
                z * 20,
                z * 20,
                z * 20,
                z * 20,
                z * 20 + 18,
                z * 20 + 18,
                z * 20 + 18,
                z * 20 + 18
            ]
        };

        blocks.append(block);

        # print "processing block %i / %i." % ( (z+1) *(j+1), modules_num * len(gen_mods));
        # print "\r"
    
        # front points
        plt.plot(gen_mods[j]['x'], gen_mods[j]['y'], [z * 20] * 4,'r-');

        # rear points
        plt.plot(gen_mods[j]['x'], gen_mods[j]['y'], [z * 20 + 18] * 4,'r-');

# print the module itself
# plt.plot(x_vect, y_vect, [0, 0, 0, 0, 0], 'r-')

# plt.scatter(points[0], points[1]);
# plt.show();
plt.savefig("geometry.png");

import json
with open('geometry/barrel.json', 'w') as outputfile:
    json.dump(blocks, outputfile)
    print "Geometry successfuly exported"
