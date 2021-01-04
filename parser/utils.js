// References: 
//   Parsing in python: https://tomassetti.me/parsing-in-python/
//   VScode lint extention: https://tomassetti.me/quick-domain-specific-languages-in-python-with-textx/





"use strict";





// REQUIRED SCRIPTS
const util = require('util');





// GLOBAL VARIABLES





// LOCAL AUX FUNCTIONS





// GLOBAL CLASSES

class Stack
{
    constructor(... args )
    {
        this.store = [... args.reverse()];
    }
    peek ()
    {
        return this.store [this.store.length - 1];
    }
    push(value)
    {
        return this.store.push (value);
    }
    pop ()
    {
        return this.store.pop ();
    }
};





// GLOBAL FUNCTIONS

function verbose (str)
{
    //util.inspect.styles ["string"] = "gray";
    //console.log (util.inspect(str, false, null, true));
}

function trace (str)
{
    //util.inspect.styles ["string"] = "cyan";
    //console.log ("T " + util.inspect(str, false, null, true));
}

function debug (str)
{
    //util.inspect.styles ["string"] = "blue";
    //console.log ("D " + util.inspect(str, false, null, true));
}

function info (str)
{
    util.inspect.styles ["string"] = "green";
    console.log ("I " + util.inspect(str, false, null, true));
}

function warn (str)
{
    util.inspect.styles ["string"] = "yellow";
    console.log ("W " + util.inspect(str, false, null, true));
}

function error (str)
{
    util.inspect.styles ["string"] = "red";
    console.log ("E " + util.inspect(str, false, null, true));
}

function call (functionName, context/*, args*/)
{
    var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for (var i = 0; i < namespaces.length; i++)
    {
        context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
}

function flat (str)
{
    return (Array.from(str)).flat (Infinity);
}

function array_rm (array, element)
{
    let idx;
    if ((idx = array.indexOf (element)) !== -1)
    {
        array.splice (idx, 1);
    }
}

function array_dict_rm (array, element_key, element_value)
{
    for (let i = 0; i < array.length; i++)
    {
        let fx = array [i];
        if (fx [element_key] === element_value)
        {
            array.splice (i, 1);
        }
    }
}

function array_edit (array, element, new_value)
{
    let idx;
    if ((idx = array.indexOf (element)) !== -1)
    {
        array [idx] = new_value;
    }
}

function clone (obj)
{
    return JSON.parse (JSON.stringify (obj));
}




// EXPORT FUNCTIONS

module.exports = {
    // CLASSES
    Stack  : Stack,

    // FUNCTIONS
    verbose       : verbose,
    trace         : trace,
    debug         : debug,
    info          : info,
    warn          : warn,
    error         : error,
    
    call          : call,
    flat          : flat,
    array_rm      : array_rm,
    array_dict_rm : array_dict_rm,
    array_edit    : array_edit,
    clone         : clone
};