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
                command: 'sudo rm -rf <%= built_project %>'
            }
        },
        useminPrepare: {
            html: '<%= compiled_static %>/templates/<%= index_html %>',
            options: {
                staging: 'tmp',
                dest: '<%= compiled_static %>'
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
                        src: '**.html',
                        dest: '<%= compiled_static %>/templates'
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
                    cwd: '<%= compiled_static %>/scss',
                    src: ['**/*.scss'],
                    dest: '<%= compiled_static %>/css/',
                    ext: '.css'
                }]
            }
		},
		watch: {
            stylesheets: {
                files: ['<%= static_dir %>/**/*.scss'],
                tasks: ['sync', 'replace', 'sass']
            },
            options: {
                spawn: false
            }
        },
        usemin: {
            html: '<%= compiled_static %>/templates/<%= index_html %>',
            options: {
                assetsDirs: ['<%= compiled_static %>/']
            }
        },
        filerev: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 8
            },
            versioning: {
                src: ['<%= compiled_static %>/js/*.js', '<%= compiled_static %>/css/*.css']
            }
        },
        "replace": {
            local: {
                src: ['build/**/*.html', 'build/**/*.scss', 'build/**/*.js'],
                overwrite: true,
                replacements: [{
                    from: /\{% bucket_name %\}/ig,
                    to: '<%= grunt.config.get(bucket-name) %>'
                }]
            }, remote: {
                src: ['build/**/*.html', 'build/**/*.css', 'build/**/*.js'],
                overwrite: true,
                replacements: [{
                    from: /\{% get_profile_url %\}/ig,
                    to: '<%= grunt.config.get(get-profile-url) %>'
                }, {
                    from: /\{% post_profile_url %\}/ig,
                    to: '<%= grunt.config.get(post-profile-url) %>'
                } ,{
                    from: /\{% get_plan_url %\}/ig,
                    to: '<%= grunt.config.get(get-plan-url) %>'
                }, {
                    from: /\{% upgrade_plan_url %\}/ig,
                    to: '<%= grunt.config.get(upgrade-plan-url) %>'
                }, {
                    from: /\{% server_host %\}/ig,
                    to: '<%= grunt.config.get(server-host) %>'
                }, {
                    from: /\{% local_realm %\}/ig,
                    to: '<%= grunt.config.get(local-realm) %>'
                }, {
                    from: new RegExp('\.\.\/\.\.\/', 'ig'),
                    to: '<% grunt.config.get(bucket-name) %>'
                }]
            }
        },
        config: {
            devel: {
                options: {
                    variables: {
                        "get-profile-url": "http://api.devel.nextcaller.com/<%= version %>/records/",
                        "get-plan-url": "http://api.devel.nextcaller.com/<%= version %>/plan/",
                        "post-profile-url": "http://api.devel.nextcaller.com/<%= version %>/users/",
                        "upgrade-plan-url": "http://dev.devel.nextcaller.com/plan/change/",
                        "server-host": "http://devel.nextcaller.com",
                        "bucket-name": "<%= bucket_name %>" || "azaza.com/",
                        "local-realm": false
                    }
                }
            },
            qa: {
                options: {
                    variables: {
                        "get-profile-url": "http://api.demo.nextcaller.com/<%= version %>/records/",
                        "get-plan-url": "http://api.demo.nextcaller.com/<%= version %>/plan/",
                        "post-profile-url": "http://api.demo.nextcaller.com/<%= version %>/users/",
                        "upgrade-plan-url": "http://dev.demo.nextcaller.com/plan/change/",
                        "server-host": "http://demo.nextcaller.com",
                        "bucket-name": "<%= bucket_name %>" || "azaza.com/",
                        "local-realm": false
                    }
                }
            },
            prod: {
                options: {
                    variables: {
                        "get-profile-url": "https://api.nextcaller.com/<%= version %>/records/",
                        "get-plan-url": "https://api.nextcaller.com/<%= version %>/plan/",
                        "post-profile-url": "https://api.nextcaller.com/<%= version %>/users/",
                        "upgrade-plan-url": "https://dev.nextcaller.com/plan/change/",
                        "server-host": "https://nextcaller.com",
                        "bucket-name": "<%= bucket_name %>" || "azaza.com/",
                        "local-realm": false
                    }
                }
            },
            local: {
                options: {
                    variables: {
                        "get-profile-url": "http://<%= local_realm %>/api/<%= version %>/records/",
                        "get-plan-url": "http://<%= local_realm %>/api/<%= version %>/plan/",
                        "post-profile-url": "http://<%= local_realm %>/api/<%= version %>/users/",
                        "upgrade-plan-url": "http://<%= local_realm %>/dev/plan/change/",
                        "server-host": "http://<%= local_realm %>",
                        "bucket-name": "../../",
                        "local-realm": true
                    }
                }
            }
        }
    });

    var version = grunt.option('version') || 'v2';
    var mode = grunt.config('mode') || 'local';
    var local_realm = grunt.config('realm') || 'localhost:8000';
    var bucket_name = grunt.config('bucket') || "";

    grunt.config.set('version', version);
    grunt.config.set('local_realm', local_realm);
    grunt.config.set('bucket_name', bucket_name);

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sync');

    grunt.registerTask('pre_build', [
        'shell:clean_static',
        'sync',
        'config:local',
        'replace:local',
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
    ]);
    grunt.registerTask('prepare-variables', [
        'config:' + mode,
        'replace:remote'
    ])
    grunt.registerTask('develop', [
        'sass',
        'watch'
    ]);
};