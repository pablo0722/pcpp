"use strict";

// REQUIRED SCRIPTS
const fs = require("fs");
const u = require('./utils');
const generator = require('./file_gen');





// LOCAL VARIABLES

const output_folder = './output';





// EFFECTS
const effects = {};
{
    const effect_filenames = ['handle_body'];
    const effect_files = [];
    effect_filenames.forEach (filename => effect_files.push (require(`./effects/${filename}`)));
    effect_files.map (fx => {effects [fx.effect_name] = fx});
}


const extentions = {
    '.ph'   : {'format' : 'header', 'out_extention' : '.h'},
    '.pcpp' : {'format' : 'source', 'out_extention' : '.cpp'}
};

if(Object.freeze)
{ 
    Object.freeze (effects);
    Object.freeze (extentions);
}




// GLOBAL VARIABLES

const scope_opened    = new u.Stack (); // stack of dicts of opened classes
const effects_to_add  = [];





// LOCAL AUX FUNCTIONS





// GLOBAL AUX FUNCTIONS

function verbose (str)
{
    u.verbose (str);
}

function trace (str)
{
    u.trace (str);
}

function flat (v)
{
    return u.flat (v);
}





// GRAMMAR FUNCTIONS

function open_project (project_name, filenames, options)
{
    scope_opened.push (
        {
            'type'      : 'project',
            'name'      : project_name,
            'filenames' : filenames,
            'options'   : options,
            'files'     : []
        });
}

function apply_effects (project)
{
    // Apply effects bottom-up

    const accesses  = ['public', 'protected', 'private'];
    const methods   = ['ctors', 'dtors', 'methods', 'op_overloads', 'variables'];
    const callbacks = ['apply_ctor', 'apply_dtor', 'apply_method', 'apply_op_overload', 'apply_variable'];
    for (let i = 0; i < project.files.length; i++)
    {
        let file = project.files [i];
        for (let i = 0; i < file.classes.length; i++)
        {
            let c = file.classes [i];
            for (let i = 0; i < accesses.length; i++)
            {
                let access = accesses [i];
                for (let i = 0; i < methods.length; i++)
                {
                    let method   = methods   [i];
                    let callback = callbacks [i];
                    for (let i = 0; i < c [access] [method].length; i++)
                    {
                        let m = c [access] [method] [i];
                        for (let i = 0; i < m.effects.length; i++)
                        {
                            let fx = m.effects [i];
                            fx [callback] (m, c [access] [method], project);
                        }
                    } // ctors
                } // method types
                for (let i = 0; i < c [access].effects.length; i++)
                {
                    let fx = c [access].effects [i];
                    fx.apply_access (c [access], c, project);
                }
            } // accesses
            for (let i = 0; i < c.effects.length; i++)
            {
                let fx = c.effects [i];
                fx.apply_class (c, file, project);
            }
        } // classes
    } // files
}

function close_project ()
{
    let project = scope_opened.pop ();

    apply_effects (project);

    console.log ('');

    project.files.forEach (file => {
        let filename = file.filename + '.json';
        let data = JSON.stringify (file, null, 4);
        fs.writeFileSync (filename, data);

        let proj_folder = file.project.toLowerCase ();
        let folder = `${output_folder}/${proj_folder}/cpp_files`;
        
        if (!fs.existsSync (folder)){
            fs.mkdirSync (folder);
        }
        generator.generate_file (filename, folder);
    });
}

function open_file (filename)
{
    let format = '';
    let in_extention = '';
    let out_extention = '';
    Object.keys (extentions).forEach (key => 
        {if (filename.endsWith (key)) {
            in_extention = key;
            format = extentions [key]['format'];
            out_extention = extentions [key]['out_extention'];
        }});

    if (format === '')
    {
        let str = `Unknown extention for '${filename}'.\n`
        str += `Valid extentions are ${JSON.stringify (extentions)}`;
        throw str;
    }

    filename = filename.split ('.');
    filename.splice (-1,1);
    filename = filename.join ('.');
    
    let path = filename.split ('/');
    filename = path [path.length - 1]
    path.splice (-1,1);
    path = path.join ('/');

    let project = scope_opened.peek ().name;

    scope_opened.push (
        {
            'type'          : 'file',
            'project'       : project,
            'path'          : path,
            'filename'      : filename,
            'format'        : format,
            'in_extention'  : in_extention,
            'out_extention' : out_extention,
            'classes'       : [],
            'define'        : null
        });

    if (format === 'header')
    {
        let f = scope_opened.peek ();
        f.define = `${project.toUpperCase ()}_${filename.toUpperCase ()}_H_`;
    }

    u.info (`Opening ${filename}, format ${format}`)
}

function close_file ()
{
    let file = scope_opened.pop ();
    
    let parent = scope_opened.peek ();
    parent.files.push (file);
    
    u.info (`Closing ${file.filename + file.in_extention}`);
}

function add_effects_on_next_element (fxs)
{
    u.info (`effects: ${fxs}`);

    fxs.forEach (e => {
        if (e in effects)
        {
            effects_to_add.push (effects [e]);
        }
    });

    return '';
}

function open_class (id)
{
    scope_opened.push (
        {
            'effects'       : [],
            'type'          : 'class',
            'id'            : id,
            'public'        : {'effects':[], 'ctors':[], 'dtors':[], 'methods':[], 'op_overloads':[], 'variables':[]},
            'protected'     : {'effects':[], 'ctors':[], 'dtors':[], 'methods':[], 'op_overloads':[], 'variables':[]},
            'private'       : {'effects':[], 'ctors':[], 'dtors':[], 'methods':[], 'op_overloads':[], 'variables':[]},
            'classes'       : [],
            'comment_pre'   : null, // comment before class
            'comment_open'  : null, // comment on same line of class open definition
            'comment_start' : null, // comment inside class definition at start
            'comment_end'   : null, // comment inside class definition at end
            'comment_close' : null, // comment on same line of class close definition
            'comment_post'  : null  // comment after class definition
        });

    scope_opened.peek ().effects.push (... effects_to_add);
    effects_to_add.length = 0;
        
    set_access ('private');

    return id;
}

function close_class (id)
{
    let c = scope_opened.pop ();

    let parent = scope_opened.peek ();
    parent.classes.push (c);

    return c.id;
}

function set_access (access)
{
    let c = scope_opened.peek ();

    c.current_access = access;

    c[access].effects.push (... effects_to_add);
    effects_to_add.length = 0;

    return access;
}
 
function add_ctor (m)
{
    let c = scope_opened.peek ();

    m.effects.push (... effects_to_add);
    effects_to_add.length = 0;

    c [c.current_access].ctors.push (m);

    return m;
}
 
function add_dtor (m)
{
    let c = scope_opened.peek ();

    m.effects.push (... effects_to_add);
    effects_to_add.length = 0;

    c [c.current_access].dtors.push (m);

    return m;
}
 
function add_method (m)
{
    let c = scope_opened.peek ();

    m.effects.push (... effects_to_add);
    effects_to_add.length = 0;

    c [c.current_access].methods.push (m);

    return m;
}
 
function add_op_overload (m)
{
    let c = scope_opened.peek ();

    m.effects.push (... effects_to_add);
    effects_to_add.length = 0;

    c [c.current_access].op_overloads.push (m);

    return m;
}

function add_variable (m)
{
    let c = scope_opened.peek ();

    m.effects.push (... effects_to_add);
    effects_to_add.length = 0;

    c [c.current_access].variables.push (m);

    return m;
}





// EXPORT FUNCTIONS

module.exports = {
    // Aux functions
    flat    : flat,
    verbose : verbose,
    trace   : trace,

    // Grammar functions
    open_project                : open_project,
    close_project               : close_project,
    open_file                   : open_file,
    close_file                  : close_file,
    add_effects_on_next_element : add_effects_on_next_element,
    open_class                  : open_class,
    close_class                 : close_class,
    set_access                  : set_access,
    add_ctor                    : add_ctor,
    add_dtor                    : add_dtor,
    add_method                  : add_method,
    add_op_overload             : add_op_overload,
    add_variable                : add_variable
};