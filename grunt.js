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
                dest: '<%= compiled_static %>/'
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
                        cwd: '<%= static_dir %>/dependencies',
                        src: '**/*.js',
                        dest: '<%= compiled_static %>/scss'
                    }
                ]
            }
        },
        sass: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= static_dir %>',
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
                        pattern: /\{% get-profile-url %\}/ig,
                        replacement: '<%= get_profile_url %>'
                    }, {
                        pattern: /\{% post-profile-url %\}/ig,
                        replacement: '<%= post_profile_url %>'
                    } ,{
                        pattern: /\{% get-plan-url %\}/ig,
                        replacement: '<%= get_plan_url %>'
                    }, {
                        pattern: /\{% upgrade-plan-url %\}/ig,
                        replacement: '<%= upgrade_plan_url %>'
                    }]
                }
            }
        }
    });

    var version = grunt.option('version') || 'v2';
    var mode = grunt.config('mode') || 'prod';

    var js_config = {
        devel: {
            "get-profile-url": "http://api.devel.nextcaller.com/<%= version %>/records/",
            "get-plan-url": "http://api.devel.nextcaller.com/<%= version %>/plan/",
            "post-profile-url": "http://api.devel.nextcaller.com/<%= version %>/users/",
            "upgrade-plan-url": "http://dev.devel.nextcaller.com/plan/change/"
        },
        qa: {
            "get-profile-url": "http://api.demo.nextcaller.com/<%= version %>/records/",
            "get-plan-url": "http://api.demo.nextcaller.com/<%= version %>/plan/",
            "post-profile-url": "http://api.demo.nextcaller.com/<%= version %>/users/",
            "upgrade-plan-url": "http://dev.demo.nextcaller.com/plan/change/"
        },
        prod: {
            "get-profile-url": "https://api.nextcaller.com/<%= version %>/records/",
            "get-plan-url": "https://api.nextcaller.com/<%= version %>/plan/",
            "post-profile-url": "https://api.nextcaller.com/<%= version %>/users/",
            "upgrade-plan-url": "https://dev.nextcaller.com/plan/change/"
        }
    }

    grunt.config.set('version', version);
    grunt.config.set('mode', mode);

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sync');

    grunt.registerTask('pre_build', [
        'shell:clean_static', //grunt-sync
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
        'usemin',
        'replace'
    ]);
    grunt.registerTask('develop', [
        'sass',
        'watch'
    ]);
};