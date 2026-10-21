use std::path::{Path, PathBuf};

use next_codablejson::{app::transform_app, page::transform_page, Config};
use swc_core::ecma::{
    parser::{EsSyntax, Syntax},
    transforms::testing::{test_fixture, FixtureTestConfig},
    visit::visit_mut_pass,
};
use testing::fixture;

fn config(input: &Path) -> Config {
    serde_json::from_str(&std::fs::read_to_string(input.with_file_name("config.json")).unwrap())
        .unwrap()
}

#[fixture("tests/fixture/custom/page/**/code.js")]
fn custom_page(input: PathBuf) {
    test_fixture(
        Syntax::Es(EsSyntax {
            jsx: true,
            ..Default::default()
        }),
        &|_| visit_mut_pass(transform_page(config(&input))),
        &input,
        &input.with_file_name("output.js"),
        FixtureTestConfig::default(),
    );
}

#[fixture("tests/fixture/custom/app/**/code.js")]
fn custom_app(input: PathBuf) {
    test_fixture(
        Syntax::Es(EsSyntax {
            jsx: true,
            ..Default::default()
        }),
        &|_| visit_mut_pass(transform_app(config(&input))),
        &input,
        &input.with_file_name("output.js"),
        FixtureTestConfig::default(),
    );
}

#[fixture("tests/fixture/custom/error/**/code.js")]
fn missing_client(input: PathBuf) {
    test_fixture(
        Syntax::Es(EsSyntax {
            jsx: true,
            ..Default::default()
        }),
        &|_| visit_mut_pass(transform_app(config(&input))),
        &input,
        &input.with_file_name("output.js"),
        FixtureTestConfig {
            allow_error: true,
            ..Default::default()
        },
    );
}

#[test]
fn custom_coder_config_requires_tools_and_rejects_unknown_options() {
    assert!(serde_json::from_str::<Config>(r#"{"customCoder":{}}"#).is_err());
    assert!(serde_json::from_str::<Config>(
        r#"{"customCoder":{"toolsModule":"custom-tools","clientModul":"typo"}}"#
    )
    .is_err());
    let config: Config =
        serde_json::from_str(r#"{"customCoder":{"toolsModule":"custom-tools"}}"#).unwrap();
    assert!(config.custom_coder.unwrap().client_module.is_none());
}
