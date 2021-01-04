"use strict";

// REQUIRED SCRIPTS
const u = require("../utils");





// LOCAL VARIABLES

const Rep = "_Rep"; // Suffix for representation (body)
const rep = Rep.toLowerCase ();





// GLOBAL VARIABLES

const effect_name = 'HANDLE-BODY';





// LOCAL AUX FUNCTIONS

function transform_to_rep (body, class_id) // transform <class_id> datatype to <class_id>_rep
{
    const accesses = ['public', 'protected', 'private'];
    const methods = ['ctors', 'dtors', 'methods', 'op_overloads'];
    accesses.forEach (access => {
        methods.forEach (method => {
            body [access] [method].forEach (m => {
                if (m.return !== undefined)
                {
                    if (m.return.datatype === class_id)
                    {
                        m.return.datatype += Rep;
                    }
                }
                m.args.forEach (arg => {
                    if (arg.datatype === class_id)
                    {
                        arg.datatype += Rep;
                    }
                });
            });
            body [access].variables.forEach (v => {
                if (v.datatype.datatype === class_id)
                {
                    v.datatype.datatype += Rep;
                }
            });
        });
    });
}

function build_handle_class (c)
{
    let handle_class = {
        'effects'       : [... c.effects],
        'type'          : 'class',
        'id'            : c.id,
        'public'        : {'effects':[... c.public.effects],    'ctors':[... c.public.ctors],    'dtors':[... c.public.dtors],    'methods':[... c.public.methods],    'op_overloads':[... c.public.op_overloads],    'variables':[]},
        'protected'     : {'effects':[... c.protected.effects], 'ctors':[... c.protected.ctors], 'dtors':[... c.protected.dtors], 'methods':[... c.protected.methods], 'op_overloads':[... c.protected.op_overloads], 'variables':[]},
        'private'       : {'effects':[... c.private.effects],   'ctors':[],                      'dtors':[],                      'methods':[],                        'op_overloads':[],                             'variables':[]},
        'classes'       : [... c.classes],
        'comment_pre'   : null, // comment before class
        'comment_open'  : null, // comment on same line of class open definition
        'comment_start' : null, // comment inside class definition at start
        'comment_end'   : null, // comment inside class definition at end
        'comment_close' : null, // comment on same line of class close definition
        'comment_post'  : null  // comment after class definition
    };

    u.array_dict_rm (handle_class.effects, "effect_name", effect_name);

    return handle_class;
}

function build_handle_file (c, parent_file, project)
{
    let handle_file = {
        'type'          : 'file',
        'project'       : project.name,
        'path'          : parent_file.path,
        'filename'      : parent_file.filename,
        'format'        : parent_file.format,
        'in_extention'  : parent_file.in_extention,
        'out_extention' : parent_file.out_extention,
        'classes'       : [c],
        'define'        : parent_file.define
    };

    return handle_file;
}

function build_body_class (c)
{
    let body_class = {
        'effects'       : [... c.effects],
        'type'          : 'class',
        'id'            : c.id + Rep,
        'public'        : {'effects':[... c.public.effects],    'ctors':u.clone (c.public.ctors),    'dtors':u.clone (c.public.dtors),    'methods':u.clone (c.public.methods),    'op_overloads':u.clone (c.public.op_overloads),    'variables':u.clone (c.public.variables)},
        'protected'     : {'effects':[... c.protected.effects], 'ctors':u.clone (c.protected.ctors), 'dtors':u.clone (c.protected.dtors), 'methods':u.clone (c.protected.methods), 'op_overloads':u.clone (c.protected.op_overloads), 'variables':u.clone (c.protected.variables)},
        'private'       : {'effects':[... c.private.effects],   'ctors':u.clone (c.private.ctors),   'dtors':u.clone (c.private.dtors),   'methods':u.clone (c.private.methods),   'op_overloads':u.clone (c.private.op_overloads),   'variables':u.clone (c.private.variables)},
        'classes'       : [... c.classes],
        'comment_pre'   : null, // comment before class
        'comment_open'  : null, // comment on same line of class open definition
        'comment_start' : null, // comment inside class definition at start
        'comment_end'   : null, // comment inside class definition at end
        'comment_close' : null, // comment on same line of class close definition
        'comment_post'  : null  // comment after class definition
    };

    transform_to_rep (body_class, c.id);

    u.array_dict_rm (body_class.effects, "effect_name", effect_name);

    return body_class;
}

function build_body_file (c, parent_file, project)
{
    let define = parent_file.define;
    define = define.substr (0, define.length - 3) + rep.toUpperCase () + "_H_";

    let body_file = {
        'type'          : 'file',
        'project'       : project.name,
        'path'          : parent_file.path,
        'filename'      : parent_file.filename + rep,
        'format'        : parent_file.format,
        'in_extention'  : parent_file.in_extention,
        'out_extention' : parent_file.out_extention,
        'classes'       : [c],
        'define'        : define
    };

    return body_file;
}





// GRAMMAR FUNCTIONS

function apply_ctor (ctor, parent_access, project)
{
}

function apply_dtor (dtor, parent_access, project)
{
}

function apply_method (method, parent_access, project)
{
}

function apply_op_overload (op_overload, parent_access, project)
{
}

function apply_variable (variable, parent_access, project)
{
}

function apply_access (access, parent_class, project)
{
}

function apply_class (c, parent, project)
{
    if (parent.type !== 'file')
    {
        throw `Class with ${effect_name} effect must be an outer class`;
    }

    let handle_class = build_handle_class (c);
    let handle_file  = build_handle_file  (handle_class, parent, project);
    let body_class   = build_body_class   (c);
    let body_file    = build_body_file    (body_class, parent, project);

    project.files.push (handle_file, body_file);
}





// EXPORT FUNCTIONS

module.exports = {
    // CONST VARIaBLES
    effect_name : effect_name,

    // FUNCTIONS
    apply_ctor        : apply_ctor,
    apply_dtor        : apply_dtor,
    apply_method      : apply_method,
    apply_op_overload : apply_op_overload,
    apply_variable    : apply_variable,
    apply_access      : apply_access,
    apply_class       : apply_class,
};