//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as moment from "moment";
import * as vscode from "vscode";
import { Config } from "../../Config";
import GitConfig from "../../GitConfig";
import TestSetup from "./TestSetup";

// Defines a Mocha test suite to group tests of similar kind together
suite("C++ - Configuration Tests", () => {
    const testSetup: TestSetup = new TestSetup("void foo();");

    // Tests
    test("Default config", () => {
        testSetup.cfg = new Config();
        const result = testSetup.SetLine("template<typename T> bool foo(T a);").GetResult();
        assert.strictEqual(result, "/**\n * @brief \n * \n * @tparam T \n * @param a \n * "
            + "@return true \n * @return false \n */");
    });

    test("Comment order", () => {
        testSetup.cfg = new Config();
        testSetup.cfg.Generic.order = ["brief", "param", "tparam", "return"];
        const result = testSetup.SetLine("template<typename T> bool foo(T a);").GetResult();
        assert.strictEqual(result, "/**\n * @brief \n * @param a \n * @tparam T \n * "
            + "@return true \n * @return false \n */");
    });

    test("Non existing order param", () => {
        testSetup.cfg = new Config();
        testSetup.cfg.Generic.order = ["breif"];
        const result = testSetup.SetLine("template<typename T> bool foo(T a);").GetResult();
        assert.strictEqual(result, "/**\n */");
    });

    test("Modified template", () => {
        testSetup.cfg = new Config();

        testSetup.cfg.C.firstLine = "";
        testSetup.cfg.C.lastLine = "";
        testSetup.cfg.C.commentPrefix = "/// ";
        testSetup.cfg.Generic.briefTemplate = "\\brief ";
        testSetup.cfg.Generic.paramTemplate = "\\param {param} ";
        testSetup.cfg.Cpp.tparamTemplate = "\\tparam {param} ";
        testSetup.cfg.Generic.returnTemplate = "\\return {type} ";

        const result = testSetup.SetLine("template<typename T> bool foo(T a);").GetResult();
        assert.strictEqual(result, "/// \\brief \n/// \n/// \\tparam T \n/// \\param a \n"
            + "/// \\return true \n/// \\return false ");

    });

    test("Disable true false on bool", () => {
        testSetup.cfg = new Config();
        testSetup.cfg.Generic.boolReturnsTrueFalse = false;
        const result = testSetup.SetLine("template<typename T> bool foo(T a);").GetResult();
        assert.strictEqual(result, "/**\n * @brief \n * \n * @tparam T \n * @param a \n"
            + " * @return bool \n */");
    });

    test("Disable including return type on function", () => {
        testSetup.cfg = new Config();
        testSetup.cfg.Generic.includeTypeAtReturn = false;

        const result = testSetup.SetLine("template<typename T> bool foo(T a);").GetResult();
        assert.strictEqual(result, "/**\n * @brief \n * \n * @tparam T \n * @param a \n"
            + " * @return  \n */");
    });

    test("Disable including return type on non-function", () => {
        testSetup.cfg = new Config();
        testSetup.cfg.Generic.includeTypeAtReturn = false;

        const result = testSetup.SetLine("bool b;").GetResult();
        assert.strictEqual(result, "/**\n * @brief \n * \n */");
    });

    test("Newlines after params and tparams but not after brief", () => {
        testSetup.cfg = new Config();
        testSetup.cfg.Generic.order = ["brief", "tparam", "empty", "param", "empty", "return"];

        const result = testSetup.SetLine("template<typename T> bool foo(T a);").GetResult();
        testSetup.cfg.Generic.order = ["brief", "empty", "tparam", "param", "return"]; // reset to default
        assert.strictEqual(result, "/**\n * @brief \n * @tparam T \n * \n * @param a \n * \n"
            + " * @return true \n * @return false \n */");
    });

    test("Function comment indentation test", () => {
        testSetup.cfg = new Config();
        let result = testSetup.SetLine("\ttemplate<typename T> bool foo(T a);").GetResult();
        assert.strictEqual(result, "/**\n\t * @brief \n\t * \n\t * @tparam T \n\t * @param a \n\t * "
            + "@return true \n\t * @return false \n\t */");

        result = testSetup.SetLine("          template<typename T> bool foo(T a);").GetResult();
        assert.strictEqual(result, "/**\n           * @brief \n           * \n           * @tparam T "
            + "\n           * @param a \n           * "
            + "@return true \n           * @return false \n           */");
    });

    test("File comment indentation test", () => {
        testSetup.cfg.File.fileOrder = [
            "file",
            "author",
            "brief",
            "version",
            "date",
            "copyright",
        ];
        testSetup.cfg.File.fileTemplate = "@file{indent:10}{name}";
        testSetup.cfg.Generic.authorTag = "@author{indent:10}{author}";
        testSetup.cfg.Generic.briefTemplate = "@brief{indent:10}Thing";
        testSetup.cfg.File.versionTag = "@version{indent:10}0.1";
        testSetup.cfg.Generic.dateTemplate = "@date{indent:10}date";
        testSetup.cfg.File.copyrightTag = ["@copyright{indent:10}Copyright(c)"];
        const result = testSetup.SetLine("").GetResult();
        assert.strictEqual(result, `/**
 * @file     MockDocument.h
 * @author   your name
 * @brief    Thing
 * @version  0.1
 * @date     date
 * @copyrightCopyright(c)
 */`);
    });

    test("File comment alignment test", () => {
        testSetup.cfg.File.fileOrder = [
            "file",
            "author",
            "brief",
            "version",
            "date",
            "copyright",
        ];
        testSetup.cfg.File.fileTemplate = "@file{align:1} {name}";
        testSetup.cfg.Generic.authorTag = "@author{align:1} {author}";
        testSetup.cfg.Generic.briefTemplate = "@brief{align:1} Thing";
        testSetup.cfg.File.versionTag = "@version{align:1} 0.1";
        testSetup.cfg.Generic.dateTemplate = "@date{align:1} date";
        testSetup.cfg.File.copyrightTag = ["@copyright{align:1} Copyright(c)"];
        const result = testSetup.SetLine("").GetResult();
        assert.strictEqual(result, `/**
 * @file      MockDocument.h
 * @author    your name
 * @brief     Thing
 * @version   0.1
 * @date      date
 * @copyright Copyright(c)
 */`);
    });

    test("Complex comment alignment test", () => {
        testSetup.cfg.Generic.order = [
            "brief",
            "empty",
            "param",
        ];
        testSetup.cfg.Generic.briefTemplate = "@brief{align:1} Thing";
        testSetup.cfg.Generic.paramTemplate = "@param{direction}{align:2}  {param}{align:3}  description"
        const result = testSetup.SetLine("void foo(int a, int b, int* output_c);").GetResult();
        assert.strictEqual(result, `/**
 * @brief Thing
 * 
 * @param[in]   a         description
 * @param[in]   b         description
 * @param[out]  output_c  description
 */`);
    });

    test("Lines to get test", () => {
        testSetup.cfg = new Config();
        testSetup.cfg.Generic.linesToGet = 2;
        const positiveResult = testSetup.SetLines(["template<typename T> bool \n", "foo(T a);"]).GetResult();
        assert.strictEqual(positiveResult, "/**\n * @brief \n * \n * @tparam T \n * @param a \n * "
            + "@return true \n * @return false \n */");
        testSetup.cfg.Generic.linesToGet = 0;
        testSetup.firstLine = 1;
        const negativeResult = testSetup.SetLines(["template<typename T> bool \n", "foo(T a);"]).GetResult();
        assert.strictEqual(negativeResult, "/**\n * @brief \n * \n */");
    });

    test("File description order test", () => {
        testSetup.cfg = new Config();
        testSetup.firstLine = 0;
        testSetup.cfg.File.fileOrder = ["brief", "author", "date", "file"];
        const result = testSetup.SetLine("").GetResult();
        assert.strictEqual(result, "/**\n * @brief \n * @author your name (you@domain.com)\n" +
            " * @date " + moment().format("YYYY-MM-DD") + "\n * @file MockDocument.h\n */");
    });

    test("Custom smart text Ctor", () => {
        testSetup.cfg.Cpp.ctorText = "Test {name}";
        const result = testSetup.SetLine("Foo();").GetResult();
        assert.strictEqual(result, "/**\n * @brief Test Foo\n * \n */");
    });

    test("Custom smart text Dtor", () => {
        testSetup.cfg.Cpp.dtorText = "Test {name}";
        const result = testSetup.SetLine("~Foo();").GetResult();
        assert.strictEqual(result, "/**\n * @brief Test Foo\n * \n */");
    });

    test("Custom smart text getter", () => {
        testSetup.cfg.C.getterText = "Test {name}";
        const result = testSetup.SetLine("int getFoo();").GetResult();
        assert.strictEqual(result, "/**\n * @brief Test Foo\n * \n * @return int \n */");
    });

    test("Custom smart text setter", () => {
        testSetup.cfg.C.setterText = "Test {name}";
        const result = testSetup.SetLine("void setFoo(int foo);").GetResult();
        assert.strictEqual(result, "/**\n * @brief Test Foo\n * \n * @param foo \n */");
    });

    test("Custom smart text factory method", () => {
        testSetup.cfg.C.factoryMethodText = "Test {name}";
        const result = testSetup.SetLine("int createFoo();").GetResult();
        assert.strictEqual(result, "/**\n * @brief Test Foo\n * \n * @return int \n */");
    });

    test("Don't split casing for smart text", () => {
        testSetup.cfg.C.factoryMethodText = "Test {name}";
        testSetup.cfg.Generic.splitCasingSmartText = false;
        const result = testSetup.SetLine("int createFooObject();").GetResult();
        assert.strictEqual(result, "/**\n * @brief Test FooObject\n * \n * @return int \n */");
    });

    test("Remove inserted '*/' from line", () => {
        const result = testSetup.SetLines(["*/", "int foo();"]).GetResult();
        assert.strictEqual(result, "/**\n * @brief \n * \n * @return int \n */");
    });

    test("Single alignment", () => {
        testSetup.cfg.Generic.paramTemplate = "@param{indent:10}{param}";
        testSetup.cfg.Cpp.tparamTemplate = "@tparam{indent:10}{param}";
        testSetup.cfg.Generic.returnTemplate = "@return{indent:10}{type}";
        testSetup.cfg.Generic.briefTemplate = "@brief{indent:10}Brief";

        const result = testSetup.SetLines(["template<typename T>", "int foo(std::string bar, T foobar);"]).GetResult();
        // tslint:disable-next-line:max-line-length
        assert.strictEqual(result, "/**\n * @brief    Brief\n * \n * @tparam   T\n * @param    bar\n * @param    foobar\n * @return   int\n */");
    });

    test("Multi alignment", () => {
        testSetup.cfg.Generic.paramTemplate = "@param{indent:10}{param}{indent:30}Parameters everywhere";
        testSetup.cfg.Cpp.tparamTemplate = "@tparam{indent:10}{param}{indent:30}I'm a template";
        testSetup.cfg.Generic.returnTemplate = "@return{indent:10}{type}{indent:30}Returns stuff";
        testSetup.cfg.Generic.briefTemplate = "@brief{indent:30}Short desc";

        const result = testSetup.SetLines(["template<typename T>", "int foo(std::string bar, T foobar);"]).GetResult();
        // tslint:disable-next-line:max-line-length
        assert.equal(result, "/**\n * @brief                        Short desc\n * \n * @tparam   T                   I'm a template\n * @param    bar                 Parameters everywhere\n * @param    foobar              Parameters everywhere\n * @return   int                 Returns stuff\n */");
    });

    test("Negative alignment tests", () => {
        testSetup.cfg.Generic.returnTemplate = "";

        const result = testSetup.SetLines(["template<typename T>", "int foo(std::string bar, T foobar);"]).GetResult();
        // tslint:disable-next-line:max-line-length
        assert.equal(result, "/**\n * @brief                        Short desc\n * \n * @tparam   T                   I'm a template\n * @param    bar                 Parameters everywhere\n * @param    foobar              Parameters everywhere\n */");
    });

    test("Multiline template", () => {
        testSetup.cfg.C.commentPrefix = "/// ";
        testSetup.cfg.C.firstLine = "";
        testSetup.cfg.C.lastLine = "";
        testSetup.cfg.Generic.briefTemplate = "<summary>\n{text}\n</summary>";
        testSetup.cfg.Generic.paramTemplate = "<param name=\"{param}\">\n</param>";
        testSetup.cfg.Generic.returnTemplate = "<returns>\n</returns>";
        const result = testSetup.SetLine("    int foo(bool a);").GetResult();
        // tslint:disable:no-trailing-whitespace
        assert.strictEqual(result,
            result, `/// <summary>
    /// 
    /// </summary>
    /// 
    /// <param name="a">
    /// </param>
    /// <returns>
    /// </returns>`,
        );
        // tslint:enable:no-trailing-whitespace
    });

    test("Macro define in funtion", () => {
        testSetup.cfg = new Config();
        testSetup.cfg.Generic.filteredKeywords = ["MOCKABLE"];
        // tslint:disable-next-line:max-line-length
        const result = testSetup.SetLine("MOCKABLE void processNetworkStatusReset( const common_n::NetworkCommands_s *networkstatus );").GetResult();
        assert.strictEqual(result, "/**\n * @brief \n * \n * @param networkstatus \n */");
    });

    test("Custom tag", () => {
        testSetup.cfg = new Config();
        testSetup.cfg.Generic.order = ["custom"];
        testSetup.cfg.Generic.customTags = ["@note"];
        const result = testSetup.SetLine("void foo();").GetResult();
        assert.strictEqual(result, "/**\n * @note\n */");
    });

    test("Custom tag expansion in function", () => {
        testSetup.cfg = new Config();
        testSetup.cfg.Generic.order = ["custom"];
        testSetup.cfg.Generic.customTags = [
            "@author {author}",
            "@date {date}",
            "@note {email}",
            "@file {file}",
        ];
        const result = testSetup.SetLine("void foo();").GetResult();
        const date = moment().format("YYYY-MM-DD");
        assert.strictEqual(result, `/**\n * @author your name\n * @date ${date}\n * @note you@domain.com\n` +
            ` * @file MockDocument.h\n */`);
    });

    test("Env variable", () => {
        testSetup.cfg = new Config();
        testSetup.cfg.Generic.order = ["custom"];
        if (process.platform === "win32") {
            testSetup.cfg.Generic.customTags = ["@author ${env:USERNAME}"];
            const res = testSetup.SetLine("void foo();").GetResult();
            // USERNAME env var is different for everybody
            assert.notStrictEqual("/**\n * @author USERNAME\n */", res);
        } else {
            testSetup.cfg.Generic.customTags = ["@author ${env:USER}"];
            const res = testSetup.SetLine("void foo();").GetResult();
            // USER env var is different for everybody
            assert.notStrictEqual("/**\n * @author USER\n */", res);
        }

        testSetup.cfg.Generic.customTags = ["@author ${env:MY_VARIABLE}"];
        const result = testSetup.SetLine("void foo();").GetResult();
        assert.strictEqual(result, "/**\n * @author MY_VARIABLE\n */");
    });

    test("Use git user.name as author", () => {
        testSetup.cfg = new Config();
        testSetup.cfg.Generic.useGitUserName = true;
        const result = testSetup.SetLine("").GetResult();
        assert.strictEqual(result, "/**\n * @brief \n * \n * @file MockDocument.h\n * @author " +
            testSetup.gitConfig.UserName +
            " (you@domain.com)\n * @date " + moment().format("YYYY-MM-DD") + "\n */");
    });

    test("Use git user.email as email", () => {
        testSetup.cfg = new Config();
        testSetup.cfg.Generic.useGitUserEmail = true;
        const result = testSetup.SetLine("").GetResult();
        assert.strictEqual(result, "/**\n * @brief \n * \n * @file MockDocument.h\n * @author your name (" +
            testSetup.gitConfig.UserEmail +
            ")\n * @date " + moment().format("YYYY-MM-DD") + "\n */");
    });

    test("Substitute author and email by git config", () => {
        testSetup.cfg = new Config();
        testSetup.cfg.Generic.useGitUserName = true;
        testSetup.cfg.Generic.useGitUserEmail = true;
        const result = testSetup.SetLine("").GetResult();
        assert.strictEqual(result, "/**\n * @brief \n * \n * @file MockDocument.h\n * @author " +
            testSetup.gitConfig.UserName + " (" + testSetup.gitConfig.UserEmail +
            ")\n * @date " + moment().format("YYYY-MM-DD") + "\n */");
    });

});
