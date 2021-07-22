
## Skins ##
1. All the skins are listed under app1/webroot/skins folder.
2. Each child folder becomes a skin category, Eg: 3_panel_fieldset_view, standard.
3. Under each category we have color variants for same skin. They contain css code.
4. The PHP templates for each skin category is listed under tushar/view/skins and maax/view/skins, 
   The later overrides the previous one when same PHP files is present in both.

## TODO ##
1. Prefix skin category folder with "." in case they are not production ready.
   You can do same with each css folder under it. 
   Such items wont show up under user preferences->themes.
   Use svn for renaming and commit changes, else old folder will show up in addition to new new one.
2. use [svn mv old_name .old_name] 


