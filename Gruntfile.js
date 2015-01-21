'use strict';
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        built_project: "build",
        compiled_static: "<%= built_project %>/static",
        index_html: "index.html",
        static_dir: "static",
        shell: {
            clean_static: {
                command: 'sudo rm -rf <%= compiled_static %>'
            }
        },
        useminPrepare: {
            html: '<%= index_html %>',
            options: {
                dest: '<%= compiled_static %>/',
                staging: 'tmp'
            }
        },
        sync: {
            scripts: {
                files: [
                    {
                        cwd: '<%= static_dir %>/js',
                        src: '**/*.js',
                        dest: '<%= compiled_static %>/js'
                    }
                ]
            },
            stylesheets: {
                files: [
                    {
                        cwd: '<%= static_dir %>/scss',
                        src: '**/*.scss',
                        dest: '<%= compiled_static %>/scss'
                    }
                ]
            },
            templates: {
                files: [
                    {
                        cwd: './',
                        src: '**/*.html',
                        dest: '<%= built_project %>/'
                    }
                ]
            },
            lib: {
                files: [
                    {
                        cwd: '<%= static_dir %>/lib',
                        src: '**/*.js',
                        dest: '<%= compiled_static %>/lib'
                    }
                ]
            }
        },
        sass: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= static_dir %>/scss',
                    src: ['**/*.scss'],
                    dest: '<%= compiled_static %>/css/',
                    ext: '.css'
                }]
            }
		},
		watch: {
            stylesheets: {
                files: ['<%= static_dir %>/**/*.scss'],
                tasks: ['sass']
            },
            options: {
                spawn: false
            }
        },
        usemin: {
            html: '<%= index_html %>',
            options: {
                assetsDirs: ['<%= compiled_static %>/']
            }
        },
        "string-replace": {
            dist: {
                files: {
                    src: '**/*.html',
                    dest: '<%= built_project %>/'
                },
                options: {
                    replacements: [{
                        pattern: /\{% get_profile_url %\}/ig,
                        replacement: '<%= get_profile_url %>'
                    }, {
                        pattern: /\{% post_profile_url %\}/ig,
                        replacement: '<%= post_profile_url %>'
                    } ,{
                        pattern: /\{% get_plan_url %\}/ig,
                        replacement: '<%= get_plan_url %>'
                    }, {
                        pattern: /\{% upgrade_plan_url %\}/ig,
                        replacement: '<%= upgrade_plan_url %>'
                    }, {
                        pattern: /\{% server_host %\}/ig,
                        replacement: '<%= server_host %>'
                    }, {
                        pattern: /\{% local_realm %\}/ig,
                        replacement: '<%= local_realm %>'
                    }, {
                        pattern: /\{% bucket_name %\}/ig,
                        replacement: '<%= bucket_name %>'
                    }]
                }
            }
        }
    });

    var version = grunt.option('version') || 'v2';
    var mode = grunt.config('mode') || 'local';
    var local_realm = grunt.config('realm') || 'localhost:8000';
    var path = require('path');

    var js_config = {
        devel: {
            "get-profile-url": "http://api.devel.nextcaller.com/" + version + "/records/",
            "get-plan-url": "http://api.devel.nextcaller.com/" + version + "/plan/",
            "post-profile-url": "http://api.devel.nextcaller.com/" + version + "/users/",
            "upgrade-plan-url": "http://dev.devel.nextcaller.com/plan/change/",
            "server-host": "http://devel.nextcaller.com",
            "bucket-name": "azaza.com/",
            "local_realm": false
        },
        qa: {
            "get-profile-url": "http://api.demo.nextcaller.com/" + version + "/records/",
            "get-plan-url": "http://api.demo.nextcaller.com/" + version + "/plan/",
            "post-profile-url": "http://api.demo.nextcaller.com/" + version + "/users/",
            "upgrade-plan-url": "http://dev.demo.nextcaller.com/plan/change/",
            "server-host": "http://demo.nextcaller.com",
            "bucket-name": "azaza.com/",
            "local_realm": false
        },
        prod: {
            "get-profile-url": "https://api.nextcaller.com/" + version + "/records/",
            "get-plan-url": "https://api.nextcaller.com/" + version + "/plan/",
            "post-profile-url": "https://api.nextcaller.com/" + version + "/users/",
            "upgrade-plan-url": "https://dev.nextcaller.com/plan/change/",
            "server-host": "https://nextcaller.com",
            "bucket-name": "azaza.com/",
            "local-realm": false
        },
        local: {
            "get-profile-url": "http://" + local_realm + "/api/" + version + "/records/",
            "get-plan-url": "http://" + local_realm + "/api/" + version + "/plan/",
            "post-profile-url": "http://" + local_realm + "/api/" + version + "/users/",
            "upgrade-plan-url": "http://" + local_realm + "/dev/plan/change/",
            "server-host": "http://" + local_realm,
            "bucket-name": path + "/static/",
            "local-realm": true
        }
    };

    for(var variable in js_config[mode]) {
        if(js_config[mode].hasOwnProperty(variable)) {
            grunt.config.set(variable.replace(/-/g,'_'), js_config[mode][variable])
        }
    }

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sync');

    grunt.registerTask('pre_build', [
        'shell:clean_static', //grunt-sync
        'sync',
        'sass',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated'
    ]
    );
    grunt.registerTask('versioning', [
        'filerev'
    ]);
    grunt.registerTask('build', [
        'usemin'
//        'replace'
    ]);
    grunt.registerTask('develop', [
        'sass',
        'watch'
    ]);
};