"use strict";

// REQUIRED SCRIPTS
const fs = require("fs");
const u = require("./utils");





// GLOBAL VARIABLES

const identation = 4;





// LOCAL AUX FUNCTIONS

function generate_ctor_decl (class_name, ctor, tabs)
{
    let content = '';

    content += `${class_name} (`;
    ctor.args.forEach (arg => {
        let arg_content = [];
        arg_content.push (... arg.qualifiers);
        arg_content.push (arg.datatype);
        arg.postfixes.forEach (pf => {
            arg_content.push (pf.postfix);
            arg_content.push (... pf.qualifiers);
        });
        arg_content.push (arg.id);
        content += arg_content.join (' ');
    });
    content += `);`;

    return content;
}

function generate_dtor_decl (class_name, ctor, tabs)
{
    let content = '~';

    content += `${class_name} (`;
    ctor.args.forEach (arg => {
        let arg_content = [];
        arg_content.push (... arg.qualifiers);
        arg_content.push (arg.datatype);
        arg.postfixes.forEach (pf => {
            arg_content.push (pf.postfix);
            arg_content.push (... pf.qualifiers);
        });
        arg_content.push (arg.id);
        content += arg_content.join (' ');
    });
    content += `);`;

    return content;
}

function generate_method_decl (class_name, method, tabs)
{
    let content = '';

    let ret = [];
    ret.push (... method.return.qualifiers);
    ret.push (method.return.datatype);
    method.return.postfixes.forEach (pf => {
        ret.push (pf.postfix);
        ret.push (... pf.qualifiers);
    });
    content += `${ret.join (' ')} ${method.id} (`;

    method.args.forEach (arg => {
        let arg_content = [];
        arg_content.push (... arg.qualifiers);
        arg_content.push (arg.datatype);
        arg.postfixes.forEach (pf => {
            arg_content.push (pf.postfix);
            arg_content.push (... pf.qualifiers);
        });
        arg_content.push (arg.id);
        content += arg_content.join (' ');
    });
    content += `);`;

    return content;
}

function generate_opov_decl (class_name, opov, tabs)
{
    let content = '';
    
    let ret = [];
    ret.push (... opov.return.qualifiers);
    ret.push (opov.return.datatype);
    opov.return.postfixes.forEach (pf => {
        ret.push (pf.postfix);
        ret.push (... pf.qualifiers);
    });
    content += `${ret.join (' ')} operator${opov.operator} (`;

    ctor.args.forEach (arg => {
        let arg_content = [];
        arg_content.push (... arg.qualifiers);
        arg_content.push (arg.datatype);
        arg.postfixes.forEach (pf => {
            arg_content.push (pf.postfix);
            arg_content.push (... pf.qualifiers);
        });
        arg_content.push (arg.id);
        content += arg_content.join (' ');
    });
    content += `);`;

    return content;
}

function generate_var_decl (class_name, variable, tabs)
{
    let content = '';

    let datatype = [];
    datatype.push (... variable.datatype.qualifiers);
    datatype.push (variable.datatype.datatype);
    variable.datatype.postfixes.forEach (pf => {
        datatype.push (pf.postfix);
        datatype.push (... pf.qualifiers);
    });
    content += `${datatype.join (' ')} ${variable.id};`;

    return content;
}

function generate_header_class_methods (class_name, methods, access, tabs)
{
    access = access.toUpperCase ();
    let tab = ' '.repeat (identation);
    let ident = tab.repeat (tabs);
    let nl = '\n' + ident;
    let content = nl;

    let method_types = [
        {'attr' : 'ctors',        'pretty' : 'CONSTRUCTORS',       'callback': generate_ctor_decl},
        {'attr' : 'dtors',        'pretty' : 'DESTRUCTORS',        'callback': generate_dtor_decl},
        {'attr' : 'methods',      'pretty' : 'METHODS',            'callback': generate_method_decl},
        {'attr' : 'op_overloads', 'pretty' : 'OPERATOR OVERLOADS', 'callback': generate_opov_decl},
        {'attr' : 'variables',    'pretty' : 'VARIABLES',          'callback': generate_var_decl},
    ];
    method_types.forEach (m_type => {
        if (methods [m_type.attr].length > 0)
        {
            content += `${tab}// ${access} ${m_type.pretty}${nl}`;
            methods [m_type.attr].forEach (method => {
                content += tab + m_type.callback (class_name, method, tabs + 1) + nl;
            });
        }
    });

    //remove last new_line
    content = content.substring (0, content.length-nl.length);
    
    return content;
}

function generate_header_class (c, tabs)
{
    let tab = ' '.repeat (identation);
    let ident = tab.repeat (tabs);
    let nl = '\n' + ident;
    let j = nl + ' '.repeat (8);
    let content = nl;

    let class_name = c.id;

    if (c.comment_pre)
    {
        content += `// ${c.comment_pre}` + nl;
    }
    content += `class ${c.id}`;
    if (c.comment_open)
    {
        content += ` // ${c.comment_open}`;
    }
    content += nl;
    content += `{` + nl;
    if (c.comment_start)
    {
        content += `// ${c.comment_start}` + nl;
    }
    content += `${tab}public:`;
    content += generate_header_class_methods (class_name, c.public, "public", tabs + 1) + nl;
    content += `${tab}protected:`;
    content += generate_header_class_methods (class_name, c.protected, "protected", tabs + 1) + nl;
    content += `${tab}private:`;
    content += generate_header_class_methods (class_name, c.private, "private", tabs + 1) + nl;
    if (c.comment_end)
    {
        content +=  nl;
        content += ` // ${c.comment_end}`;
    }
    content += `};`;
    if (c.comment_close)
    {
        content += ` // ${c.comment_close}`;
    }
    content += nl;
    if (c.comment_post)
    {
        content += `// ${c.comment_post}`;
    }

    return content;
}

function generate_header (file)
{
    let tabs = 0;
    let content = '';
    
    content += `#ifndef ${file.define}\n`;
    content += `#define ${file.define}\n`;

    file.classes.forEach (c => {
        content += generate_header_class (c, tabs);
    });

    content += `\n`;
    content += `#endif // ${file.define}\n`;

    return content;
}

function generate_source (file)
{
}





// GLOBAL FUNCTIONS

function generate_file (json_filename, output_folder)
{
    let rawdata = fs.readFileSync (json_filename);
    let file = JSON.parse(rawdata);

    let content = '';
    let filename = `${output_folder}/${file.filename}${file.out_extention}`;

    if (file.format === 'header')
    {
        content = generate_header (file);
    }
    else if (file.format === 'source')
    {
        content = generate_source (file);
    }
    
    fs.writeFileSync (filename, content);

    u.info (`+ ${filename} saved`);
}





module.exports = {
    generate_file : generate_file
};