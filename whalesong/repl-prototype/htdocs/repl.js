var COMPILED = [];

$(document).ready(function() {
    "use strict";    

    var repl = $("#repl");
    var output = $("#output");
    
    plt.runtime.currentMachine.params.currentDisplayer = function(MACHINE, domNode) {
        $(domNode).appendTo(output);
    }
    plt.runtime.currentMachine.params.currentErrorDisplayer = function(MACHINE, domNode) {
        $(domNode).appendTo(output);
    }


    var initializeLanguage = function(afterLanguageInitialization) {
        // Load up the language.
        plt.runtime.currentMachine.modules['whalesong/lang/whalesong.rkt'].invoke(
            plt.runtime.currentMachine,
            function() {
                console.log("Environment initialized.");
                afterLanguageInitialization();
            },
            function() {
                // Nothing should work if we can't get this to work.
                alert("uh oh!");
            });
    };


    repl.attr('disabled', 'true');
    initializeLanguage(
        function() {
            repl.removeAttr('disabled');
            // Hook up a simple one-line REPL with enter triggering evaluation.
            repl.keypress(function(e) {
                if (e.which == 13 && !repl.attr('disabled')) {
                    var src = repl.val();
                    $(this).val("");
                    repl.attr('disabled', 'true');
                    repl.val("... evaluating...");
                    evaluate(src, 
                             function() { repl.removeAttr('disabled');
                                          repl.val("");});
                } 
            });
        });


    var evaluate = function(src, after) {
        console.log("about to eval", src);
        var onCompile = function(compiledResult) {
            console.log("compilation got", compiledResult);
            COMPILED.push(compiledResult);
            eval(compiledResult.compiled);
            // FIXME
            plt.runtime.currentMachine.modules['whalesong/repl-prototype/anonymous-module.rkt'].invoke(
                plt.runtime.currentMachine,
                function() {
                    after();
                },
                function() {
                    after();
                });
        };
        var onError = function(err) {
            console.log("error", err);
            after();
        };

        $.ajax({dataType: 'json',
                url: '/compile',
                data: { src: src },
                success: onCompile,
                error: onError});
    };

});