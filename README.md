# The Contracterator
Mail-merge-like behavior for generating contracts and other docs from google docs templates and spreadsheets. Useful when you need to generate a ton of similar google docs from a template. 

Use with https://script.google.com/

# HOW IT WORKS

You create a google spreadsheet with the following stuff in it:

A sheet called 'settings' which has some general settings about how to name the generated docs and where to put them:
![settings](http://i.imgur.com/WW4Rn2x.png)

A sheet called 'data' which has the actual data you want to use
![data](http://i.imgur.com/OwDRVDz.png)

A template which has the variable names to be substituted.  For instance ```:PerformerName:``` in this example will be substituted with that column from the spreadsheet.
![template](http://i.imgur.com/XpqdFmp.png)

After you run the script, here's the final result!
![final result](http://i.imgur.com/Tex37Kn.png)

Based off of:
https://github.com/inviqa/SysAdmin/tree/master/goddamn

Authors: Dominic Cerquetti, Lisa Hartsock

MIT LICENSE

# TODO
- Need to figure out how to make running the script a bit more user-friendly.
- Add option to email stuff out later
