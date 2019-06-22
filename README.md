# twinepm

A command-line tool and Node module.

## Introduction

This repository contains the client-side library used to abstract querying the TwinePM registry. It can be used either as a command line tool with `src/cli/index.js`, or as a module to be required or imported in other codebases.

## Installation

`npm install -S twinepm`

## What's here

Functions for every basic query use case. Check the [typedocs](docs/typescript/index.html) for more details.

## What's not here

There is currently no privileged execution (any command involving login or ownership) possible with this package and no intention to add this functionality. Adding and editing packages will be done on the web client for the foreseeable future.
