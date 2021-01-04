"use strict";

const parser = require ("../../parser/cpp_grammar");

let filename = `${__dirname}/LHandle_Body.ph`;

parser.parse ('Test_Project', [filename]);
