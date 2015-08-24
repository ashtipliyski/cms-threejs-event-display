#!/usr/bin/env python2

"""
Description of RAW data format:

Layer/Disk Identifier (B=barrel, E=endcap)
PS or 2S module (PS=1,2S=0)
Module ID
Sensor ID (top/bottom sensor)
3D Cyclindrical Polar Coordinate Vector[x8] (r, phi, z)

"""

import sys, getopt;

argv = sys.argv[1:]

inputfile = ''
outputfile = ''
verbose = False

def display_help():
    print "process_geometry -i <inputfile> -o <outputfile> [-v -h]"

try:
    opts, args = getopt.getopt(argv, "hi:o:v", ["ifile=", "ofile="])
except getopt.GetoptError:
    display_help()
    sys.exit(2)

for opt, arg in opts:
    if opt == "-h":
        display_help()
        sys.exit()
    elif opt in ("-i", "--ifile"):
        inputfile = arg
    elif opt in ("-o", "--ofile"):
        outputfile = arg
    elif opt in ("-v", "--verbose"):
        verbose = True

if inputfile == '':
    print "Input file must be specified, exiting."
    display_help()
    sys.exit(2)

if outputfile == '':
    print "Output file must be specified, exiting."
    display_help()
    sys.exit(2)
        
import csv;
import numpy as np;

# raw_filename = "raw/geometry.csv"
raw_filename = inputfile

with open(raw_filename, "rb") as file:
    reader = csv.reader(file);
    
    data = []

    if verbose:
        print "Processing data"

    # prev_obj = {};
    prev_r_vect = []
    prev_theta_vect = []
    prev_mod_id = 0
    
    for row in reader:
        identifier = row[0]
        mod_type = row[1]
        mod_id   = row[2]
        sensor_id = row[3]
        r_vect = [
            float(row[4]), 
            float(row[7]),
            float(row[10]),
            float(row[13]),
            float(row[16]),
            float(row[19]),
            float(row[22]),
            float(row[25])
        ];

        theta_vect = [
            float(row[5]),
            float(row[8]),
            float(row[11]),
            float(row[14]),
            float(row[17]),
            float(row[20]),
            float(row[23]),
            float(row[26])
        ];

        

        # add condition here to modify obj in a way that combines the
        # positions of two previous modules
        
        if mod_id == prev_mod_id:
            x_vect = [
            ];
            y_vect = [
            ];
            
            for i in range(0, len(r_vect) / 2):
                x_vect.append(r_vect[i] * np.cos(theta_vect[i]));
                y_vect.append(r_vect[i] * np.sin(theta_vect[i]));
                
            for i in range(len(r_vect) / 2, len(r_vect)):
                x_vect.append(prev_r_vect[i] * np.cos(prev_theta_vect[i]));
                y_vect.append(prev_r_vect[i] * np.sin(prev_theta_vect[i]));

            z_vect = [
                float(row[6]),
                float(row[9]),
                float(row[12]),
                float(row[15]),
                float(row[18]),
                float(row[21]),
                float(row[24]),
                float(row[27])
            ];
            
            obj = {
                "identifier": identifier,
                "mod_type": mod_type,
                "mod_id": mod_id,
                "sensor_id": sensor_id,
                "x": x_vect,
                "y": y_vect,
                "z": z_vect
            }
        
            data.append(obj)

        prev_mod_id = mod_id;
        prev_r_vect = r_vect
        prev_theta_vect = theta_vect
#    print data

if verbose:
    print "Exporting data";

import json
with open(outputfile, 'w') as o_file:
    json.dump(data, o_file)
    
    if verbose:
        print "Geometry successfuly exported"
