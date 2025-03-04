SP1 Testnet Launch: the fastest, feature-complete zkVM for developers
=====================================================================

#### [Uma Roy](https://blog.succinct.xyz/author/uma/)

May 8, 2024 — 6 min read

In its February [release](https://blog.succinct.xyz/introducing-sp1/), SP1 did not have recursion and onchain verification, limiting it to offchain use-cases. Today, we are excited to announce the implementation of SP1’s performant STARK recursion, enabling blazing fast end-to-end ZK proof generation with onchain verification on any EVM-compatible chain.

With this testnet launch, SP1 is the **fastest, feature-complete zkVM** for developers. It is the only zkVM that is fully open-source, supports the Rust standard library, has customizable precompiles for state of the art performance, and leverages the latest techniques in STARKs for performant recursion and **onchain verification**. Furthermore, SP1’s novel precompile-centric architecture for common operations like hashing, elliptic curve operations, and more allows for an **order of magnitude performance gain** for blockchain use-cases like ZK rollups, ZK bridges, and more. 

Get started with the [docs](https://succinctlabs.github.io/sp1/?ref=blog.succinct.xyz) today or clone the [project template](https://github.com/succinctlabs/sp1-project-template?ref=blog.succinct.xyz).

SP1 is the fastest, feature-complete zkVM 
------------------------------------------

**Get started today:** Developers can get started by following the [installation instructions](https://succinctlabs.github.io/sp1/getting-started/install.html?ref=blog.succinct.xyz) and creating a new project with “cargo prove new” or cloning the template repo [here](https://github.com/succinctlabs/sp1-project-template?ref=blog.succinct.xyz). Follow the [docs](https://succinctlabs.github.io/sp1/?ref=blog.succinct.xyz) to write programs that implement ZK light clients, ZK rollups and more. Using SP1’s SDK, developers can deploy an SP1 EVM verifier to any testnet of their choosing and generate Groth16 proofs that can be verified onchain for ~300,000 gas.

**SP1 is the** _**only**_ **zkVM with all of the features that developers need:**

*   **Can write Rust (including std) and use existing crates:** With SP1, developers can utilize existing Rust crates (including revm, alloy, tendermint-rs, serde, json, etc.) to write verifiable programs. SP1 has standard library support, allowing developers to code in Rust as they normally would.
    
*   **Recursion + Onchain verification:** SP1 uses performant STARK recursion and a Groth16 STARK to SNARK wrapper to shrink the size of SP1 proofs to one that can be verifiable on any EVM chain for ~300k gas.
    
*   **Blazing fast performance:** SP1’s novel “precompile-centric” architecture allows for extremely fast and cost-effective proof generation (often by an order of magnitude) for common blockchain applications like ZK rollups (including zkEVMs), ZK light clients and more.
    
*   **100% open-source:** SP1 is 100% open-source, with all constraint logic in the open and an MIT licensed codebase. 
    
*   **SP1 recursion within SP1:** for many use-cases, like proof aggregation or rollups, the ability to verify an SP1 proof within SP1 is critical for chaining together many proofs. SP1 supports efficient SP1 recursion and users can check out an example of this functionality in this [example repository](https://github.com/succinctlabs/sp1-aggregation-example?ref=blog.succinct.xyz).
    

**SP1 Mainnet Timeline:** For the past few months, we have been getting SP1 audited by several world-class ZK auditing firms (alongside Plonky 3, one of SP1’s core open-source dependencies). Expect more details on SP1’s mainnet timeline in the upcoming weeks!

SP1 outperforms other zkVMs by an order of magnitude
----------------------------------------------------

Over the past few months, SP1’s performance has improved significantly thanks to support for AVX-512 in Plonky3, batched lookup arguments, optimized prover memory usage, and improved arithmetization. We benchmark SP1 and Risc0 on end to end proving time to get an onchain verifiable proof on a suite of realistic programs, including Merkle proof verification, a Tendermint light client and a type 1 zkEVM that leverages Reth. 

**We’re excited to see the vision of a precompile-centric architecture for zkVMs become a standard across the industry.** [RISC0](https://www.risczero.com/blog/zkvm-performance-upgrades-roadmap-q1-q2-2024?ref=blog.succinct.xyz) and [Jolt](https://twitter.com/moodlezoup/status/1787890096164745459?ref=blog.succinct.xyz) have both recently announced that their roadmaps include adding support for precompiles. It will be interesting to revisit these results when these features get implemented by others.

Note that benchmarking is always a point in time comparison and given the complex, multi-dimensional nature of zkVM performance, any benchmark presents only a simplified view of performance. We choose to benchmark on CPU, similar to the open-source JOLT zkVM benchmark [repo](https://github.com/a16z/zkvm-benchmarks?ref=blog.succinct.xyz), but Risc0 also has support for GPUs.

Comparison of end to end time to get EVM verifiable proof.

SP1’s Recursion Architecture 
-----------------------------

To build performant recursion, we built an entirely [new proving stack](https://github.com/succinctlabs/sp1/tree/main/recursion?ref=blog.succinct.xyz) (the first open-source zkVM recursion stack) that allows for programmable verification of SP1 proofs.

*   **Recursion zkVM.** A [zkVM](https://github.com/succinctlabs/sp1/tree/main/recursion/core?ref=blog.succinct.xyz) that implements our recursion-specific ISA (leveraging many similar primitives from our core RISC-V VM) and is heavily optimized for succinct verification.
    
*   **Recursion DSL.** A custom Rust-based [domain-specific-language](https://github.com/succinctlabs/sp1/blob/main/recursion/compiler/examples/fibonacci.rs?ref=blog.succinct.xyz) that natively supports fields, extension fields, accelerated recursion primitives, and ZK-friendly memory. We implement a STARK verification program in this DSL.
    
*   **Recursion Compiler.** A [compiler](https://github.com/succinctlabs/sp1/tree/main/recursion/compiler/src?ref=blog.succinct.xyz) that compiles programs written in the recursion DSL into multiple target backends, including our Recursion zkVM ISA and a Gnark circuit (used for PLONK-KZG verification of STARK proofs).
    

We believe that this toolchain, including our recursion DSL and recursion compiler, are generally useful public goods that can be utilized by many different teams to implement recursion for new proof systems, including JOLT and Binius. Please reach out to us if you’re interested in using this tooling and we are happy to provide guidance!

SP1’s updated performance vs. JOLT
----------------------------------

We also benchmark SP1 against the newly released JOLT to provide an updated view of how SP1 compares, given its latest performance improvements. JOLT is still a work in progress, and currently does not support recursion or on-chain verification, cannot accelerate workloads with precompiles, has a relatively small upper bound on the maximum cycle count (~16 million), and only supports the RISCV32I variant of RISC-V which does not support instructions for multiplications or divisions. As a result, we can only benchmark JOLT on simple programs, such as their SHA-2 chain program used in their benchmarks (shown below). Nonetheless, given JOLT’s recency and room for further optimizations, we are impressed with its performance and find it quite an interesting line of work. 

We show that SP1 out-performs JOLT for similar proof size and similar cycle count.

Appendix
--------

**End to end benchmarking on recursion and time to get to EVM verifiable Groth16 proof.**

**Program**

**zkVM**

**Cycle Count**

**End to end wall-clock time for Groth16 proof** 

**Core Proving Time (sec)**

**Recursive Proving Time (sec)**

**Groth16 Wrapper Time (sec)**

Merkle Proof Verification (SSZ)

Risc0

29656297

1384 secs / 23 mins

1085

252

47

SP1

22170011

521 secs / 8.6 mins (2.6x)

211

165 

144

Tendermint Light Client

Risc0

120031599

6874 secs / 1.9 hours

5654

1172

47

SP1

29348142

641 / 10.7 mins (10.7x)

270

226

144

zkEVM block (with Reth)

Risc0

1307453036

65314 secs / 18 hours

53179

12087

47

SP1

199644261

2307 secs / 38 mins **(28x)**

1417

744

145

**Benchmarking Methodology**

The benchmarking programs can be found in [this repo](https://github.com/succinctlabs/zkvm-perf?ref=blog.succinct.xyz), including Merkle Proof Verification (SSZ withdrawals), the Tendermint ZK Light Client and SP1-Reth. For each program, we generated a proof for both zkVMs, and patched all relevant crates (including the revm, reth, sha2, crypto-bigint, curve25519-dalek and k256 crates). The “# of Cycles'” column is the number of RISC-V instructions executed by the program. The proof generation time is in seconds. Note that the cycle count for the Tendermint and Reth program is provided as 2 numbers because it is significantly smaller in the SP1 zkVM because of SP1's first-class support for precompiles. Note that all the times in the above table _do not represent latency_ as that can be decreased with parallelized proof generation across the core and recursive stages. The core proving time + recursive proving time is the time it takes to get to a constant-sized proof. Note that SP1’s Groth16 wrapper time also includes a “shrinking” stage not present in Risc0 that adds a constant overhead of ~50 seconds, which is why the timing in that phase is longer.

SP1 was benchmarked using the poseidon2 hash function and all standard settings. All other settings were the default Risc0 prover settings in their version 0.21 release. The benchmark was run on a AWS Linux CPU machine (r7i.16xlarge) with 64 vCPUs and 512GB of RAM, with a 3-year reserved pricing of $1.92 per hour.

**SP1 vs. JOLT benchmark**

Cycle Count (JOLT / SP1)

Jolt Time

Jolt proof size

SP1 time

SP1 proof size

Sha2 chain

8867928  / 10564984

103.29

10135122

62.25 (1.66x)

7435474 (1.36x)

Fibonacci

14224310 / 3606069

112.17

10123973

34.70

(3.23x)

2812745 (3.60x)

Loop

12288011 / 12292931

103.93

10120303

53.79

(1.93x)

7858871

(1.29x)

We benchmark JOLT with its default settings and SP1 using the poseidon hash function and with a shard size of 2^21 to make the proof size comparable to JOLT’s. The benchmark was run on a AWS Linux CPU machine (r7i.16xlarge) with 64 vCPUs and 512GB of RAM, with a 3-year reserved pricing of $1.92 per hour.

NB: Note that due to the very complex, multi-dimensional nature of zkVM performance (including factors like hardware, single-node vs. multi-node performance, memory usage, recursion cost, hash function selection) these benchmarks only present a simplified view of performance. We tried our best to provide as fair of a comparison as possible, although it is difficult for a single benchmark to capture all nuances.


Introduction
============

_Documentation for SP1 users and developers_.

SP1 is a performant, open-source zero-knowledge virtual machine (zkVM) that verifies the execution of arbitrary Rust (or any LLVM-compiled language) programs.

SP1 has undergone multiple audits from leading ZK security firms and is currently used in production by many top blockchain teams.

The future of ZK is writing normal code[​](https://docs.succinct.xyz/docs/sp1/introduction#the-future-of-zk-is-writing-normal-code)
-----------------------------------------------------------------------------------------------------------------------------------

Zero-knowledge proofs (ZKPs) are one of the most critical technologies to blockchain scaling, interoperability and privacy. But, historically building ZKP systems was extremely complicated--requiring large teams with specialized cryptography expertise and taking years to go to production.

SP1 provides a performant, general-purpose zkVM that enables **any developer** to use ZKPs by writing normal code (in Rust), and get cheap and fast proofs. SP1 will enable ZKPs to become mainstream, introducing a new era of verifiability for all of blockchain infrastructure and beyond.

SP1 enables a diversity of use-cases[​](https://docs.succinct.xyz/docs/sp1/introduction#sp1-enables-a-diversity-of-use-cases)
-----------------------------------------------------------------------------------------------------------------------------

ZKPs enable a diversity of use-cases in blockchain and beyond, including:

*   Rollups: Use SP1 to generate a ZKP for the state transition function of your rollup and connect to Ethereum, Bitcoin or other chains with full validity proofs or ZK fraud proofs.
    
*   Interoperability: Use SP1 for fast-finality, cross rollup interoperability
    
*   Bridges: Use SP1 to generate a ZKP for verifying consensus of L1s, including Tendermint, Ethereum’s Light Client protocol and more, for bridging between chains.
    
*   Oracles: Use SP1 for large scale computations with onchain state, including consensus data and storage data.
    
*   Aggregation: Use SP1 to aggregate and verify other ZKPs for reduced onchain verification costs.
    
*   Privacy: Use SP1 for onchain privacy, including private transactions and private state.

Why use SP1?
============

Use-Cases[​](https://docs.succinct.xyz/docs/sp1/why-use-sp1#use-cases)
----------------------------------------------------------------------

Zero-knowledge proofs (ZKPs) are a powerful primitive that enable **verifiable computation**. With ZKPs, anyone can verify a cryptographic proof that a program has executed correctly, without needing to trust the prover, re-execute the program or even know the inputs to the program.

Historically, building ZKP systems has been extremely complicated, requiring large teams with specialized cryptography expertise and taking years to go to production. SP1 is a performant, general-purpose zkVM that solves this problem and creates a future where all blockchain infrastructure, including rollups, bridges, coprocessors, and more, utilize ZKPs **via maintainable software written in Rust**.

SP1 is especially powerful in blockchain contexts which rely on verifiable computation. Example applications include:

*   [Rollups](https://ethereum.org/en/developers/docs/scaling/zk-rollups/): SP1 can be used in combination with existing node infrastructure like [Reth](https://github.com/paradigmxyz/reth) to build rollups with ZKP validity proofs or ZK fraud proofs.
    
*   [Coprocessors](https://crypto.mirror.xyz/BFqUfBNVZrqYau3Vz9WJ-BACw5FT3W30iUX3mPlKxtA): SP1 can be used to outsource onchain computation to offchain provers to enable use cases such as large-scale computation over historical state and onchain machine learning, dramatically reducing gas costs.
    
*   [Light Clients](https://ethereum.org/en/developers/docs/nodes-and-clients/light-clients/): SP1 can be used to build light clients that can verify the state of other chains, facilitating interoperability between different blockchains without relying on any trusted third parties.
    

SP1 has already been integrated in many of these applications, including but not limited to:

*   [SP1 Tendermint](https://github.com/succinctlabs/sp1-tendermint-example): An example of a ZK Tendermint light client on Ethereum powered by SP1.
    
*   [SP1 Reth](https://github.com/succinctlabs/rsp): A performant, type-1 zkEVM written in Rust & SP1 using Reth.
    
*   [SP1 Contract Call](https://github.com/succinctlabs/sp1-contract-call): A lightweight library to generate ZKPs of Ethereum smart contract execution
    
*   and many more!
    

SP1 is used by protocols in production today:

*   [SP1 Blobstream](https://github.com/succinctlabs/sp1-blobstream): A bridge that verifies [Celestia](https://celestia.org/) “data roots” (a commitment to all data blobs posted in a range of Celestia blocks) on Ethereum and other EVM chains.
    
*   [SP1 Vector](https://github.com/succinctlabs/sp1-vector): A bridge that relays [Avail's](https://www.availproject.org/) merkle root to Ethereum and also functions as a token bridge from Avail to Ethereum.
    

100x developer productivity[​](https://docs.succinct.xyz/docs/sp1/why-use-sp1#100x-developer-productivity)
----------------------------------------------------------------------------------------------------------

SP1 enables teams to use ZKPs in production with minimal overhead and fast timelines.

**Maintainable:** With SP1, you can reuse existing Rust crates, like revm, reth, tendermint-rs, serde and more, to write your ZKP logic in maintainable, Rust code.

**Go to market faster:** By reusing existing crates and expressing ZKP logic in regular code, SP1 significantly reduces audit surface area and complexity, enabling teams to go to market with ZKPs faster.

Blazing Fast Performance[​](https://docs.succinct.xyz/docs/sp1/why-use-sp1#blazing-fast-performance)
----------------------------------------------------------------------------------------------------

SP1 is the fastest zkVM and has blazing fast performance on a variety of realistic blockchain workloads, including light clients and rollups. With SP1, ZKP proving costs are an order of magnitude less than alternative zkVMs or even circuits, making it cost-effective and fast for practical use.

Read more about our benchmarking results [here](https://blog.succinct.xyz/sp1-benchmarks-8-6-24).

Open Source[​](https://docs.succinct.xyz/docs/sp1/why-use-sp1#open-source)
--------------------------------------------------------------------------

SP1 is 100% open-source (MIT / Apache 2.0) with no code obfuscation and built to be contributor friendly, with all development done in the open. Unlike existing zkVMs whose constraint logic is closed-source and impossible to audit or modify, SP1 is modularly architected and designed to be customizable from day one. This customizability (unique to SP1) allows for users to add “precompiles” to the core zkVM logic that yield substantial performance gains, making SP1’s performance not only SOTA vs. existing zkVMs, but also competitive with circuits in a variety of use-cases.

What is a zkVM?
===============

A zero-knowledge virtual machine (zkVM) is zero-knowledge proof system that allows developers to prove the execution of arbitrary Rust (or other LLVM-compiled language) programs.

Conceptually, you can think of the SP1 zkVM as proving the evaluation of a function f(x) = y by following the steps below:

*   Define f using normal Rust code and compile it to an ELF (covered in the [writing programs](https://docs.succinct.xyz/docs/sp1/writing-programs/setup) section).
    
*   Setup a proving key (pk) and verifying key (vk) for the program given the ELF.
    
*   Generate a proof π using the SP1 zkVM that f(x) = y with prove(pk, x).
    
*   Verify the proof π using verify(vk, x, y, π).
    

As a practical example, f could be a simple Fibonacci [program](https://github.com/succinctlabs/sp1/blob/main/examples/fibonacci/program/src/main.rs). The process of generating a proof and verifying it can be seen [here](https://github.com/succinctlabs/sp1/blob/main/examples/fibonacci/script/src/main.rs).

For blockchain applications, the verification usually happens inside of a [smart contract](https://github.com/succinctlabs/sp1-project-template/blob/main/contracts/src/Fibonacci.sol).

How does SP1 Work?[​](https://docs.succinct.xyz/docs/sp1/what-is-a-zkvm#how-does-sp1-work)
------------------------------------------------------------------------------------------

At a high level, SP1 works with the following steps:

*   Write a program in Rust that defines the logic of your computation for which you want to generate a ZKP.
    
*   Compile the program to the RISC-V ISA (a standard Rust compilation target) using the cargo prove CLI tool (installation instructions [here](https://docs.succinct.xyz/docs/sp1/getting-started/install)) and generate a RISC-V ELF file.
    
*   SP1 will prove the correct execution of arbitrary RISC-V programs by generating a STARK proof of execution.
    
*   Developers can leverage the sp1-sdk crate to generate proofs with their ELF and input data. Under the hood the sp1-sdk will either generate proofs locally or use a beta version of Succinct's prover network to generate proofs.
    

SP1 leverages performant STARK recursion that allows us to prove the execution of arbitrarily long programs and also has a STARK -> SNARK "wrapping system" that allows us to generate small SNARK proofs that can be efficiently verified on EVM chains.

Proof System[​](https://docs.succinct.xyz/docs/sp1/what-is-a-zkvm#proof-system)
-------------------------------------------------------------------------------

For more technical details, check out the SP1 technical note that explains our proof system in detail. In short, we use:

*   STARKs + FRI over the Baby Bear field
    
*   We use performant STARK recursion that allows us to prove the execution of arbitrarily long programs
    
*   We have a system of performant precompiles that accelerate hash functions and cryptographic signature verification that allow us to get substantial performance gains on blockchain workloads

Installation
============

SP1 currently runs on Linux and macOS. You can either use prebuilt binaries through sp1up or build the Succinct [Rust toolchain](https://rust-lang.github.io/rustup/concepts/toolchains.html) and CLI from source.

Requirements[​](https://docs.succinct.xyz/docs/sp1/getting-started/install#requirements)
----------------------------------------------------------------------------------------

*   [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
    
*   [Rust (Nightly)](https://www.rust-lang.org/tools/install)
    
*   [Docker](https://docs.docker.com/get-docker/)
    

Option 1: Prebuilt Binaries (Recommended)[​](https://docs.succinct.xyz/docs/sp1/getting-started/install#option-1-prebuilt-binaries-recommended)
-----------------------------------------------------------------------------------------------------------------------------------------------

sp1up is the SP1 toolchain installer. Open your terminal and run the following command and follow the instructions:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   curl -L https://sp1up.succinct.xyz | bash   `

Then simply follow the instructions on-screen, which will make the sp1up command available in your CLI.

After following the instructions, you can run sp1up to install the toolchain and the cargo prove CLI:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   sp1up   `

This will install two things:

1.  The succinct Rust toolchain which has support for the riscv32im-succinct-zkvm-elf compilation target.
    
2.  cargo prove CLI tool that provides convenient commands for compiling SP1 programs and other helper functionality.
    

You can verify the installation of the CLI by running cargo prove --version:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cargo prove --version   `

You can check the version of the Succinct Rust toolchain by running:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   RUSTUP_TOOLCHAIN=succinct cargo --version   `

or equivalently:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cargo +succinct --version   `

If this works, go to the [next section](https://docs.succinct.xyz/docs/sp1/getting-started/quickstart) to compile and prove a simple zkVM program.

### Troubleshooting[​](https://docs.succinct.xyz/docs/sp1/getting-started/install#troubleshooting)

#### Rate-limiting[​](https://docs.succinct.xyz/docs/sp1/getting-started/install#rate-limiting)

If you experience [rate-limiting](https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api?apiVersion=2022-11-28#rate-limiting) when using the sp1up command, you can resolve this by using the --token flag and providing your GitHub token. To create a Github token, follow the instructions [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic).

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   sp1up --token ghp_YOUR_GITHUB_TOKEN_HERE   `

#### Unsupported OS Architectures[​](https://docs.succinct.xyz/docs/sp1/getting-started/install#unsupported-os-architectures)

Currently our prebuilt binaries are built on Ubuntu 20.04 (22.04 on ARM) and macOS. If your OS uses an older GLIBC version, it's possible these may not work and you will need to [build the toolchain from source](https://docs.succinct.xyz/docs/sp1/getting-started/install#option-2-building-from-source).

#### Conflicting cargo-prove installations[​](https://docs.succinct.xyz/docs/sp1/getting-started/install#conflicting-cargo-prove-installations)

If you have installed cargo-prove from source, it may conflict with sp1up's cargo-prove installation or vice versa. You can remove the cargo-prove that was installed from source with the following command:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   rm ~/.cargo/bin/cargo-prove   `

Or, you can remove the cargo-prove that was installed through sp1up:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   rm ~/.sp1/bin/cargo-prove   `

Option 2: Building from Source[​](https://docs.succinct.xyz/docs/sp1/getting-started/install#option-2-building-from-source)
---------------------------------------------------------------------------------------------------------------------------

Warning: This option will take a long time to build and is only recommended for advanced users.

Make sure you have installed the [dependencies](https://github.com/rust-lang/rust/blob/master/INSTALL.md#dependencies) needed to build the rust toolchain from source.

Clone the sp1 repository and navigate to the root directory.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   git clone git@github.com:succinctlabs/sp1.gitcd sp1cd cratescd clicargo install --locked --force --path .cd ~cargo prove build-toolchain   `

Building the toolchain can take a while, ranging from 30 mins to an hour depending on your machine. If you're on a machine that we have prebuilt binaries for (ARM Mac or x86 or ARM Linux), you can use the following to download a prebuilt version.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cargo prove install-toolchain   `

To verify the installation of the toolchain, run and make sure you see succinct:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   rustup toolchain list   `

You can delete your existing installation of the toolchain with:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   rustup toolchain remove succinct   `

Quickstart
==========

In this section, we will show you how to create a simple Fibonacci program using the SP1 zkVM.

Create an SP1 Project[​](https://docs.succinct.xyz/docs/sp1/getting-started/quickstart#create-an-sp1-project)
-------------------------------------------------------------------------------------------------------------

### Option 1: Cargo Prove New CLI (Recommended)[​](https://docs.succinct.xyz/docs/sp1/getting-started/quickstart#option-1-cargo-prove-new-cli-recommended)

You can use the cargo prove CLI to create a new project using the cargo prove new <--bare|--evm>  command. The --bare option sets up a basic SP1 project for standalone zkVM programs, while --evm adds additional components including Solidity contracts for on-chain proof verification.

This command will create a new folder in your current directory which includes solidity smart contracts for onchain integration.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cargo prove new --evm fibonaccicd fibonacci   `

note

If you use the --evm option, you will need to install foundry to compile the solidity contracts. Please follow the instructions [on the official Foundry docs](https://book.getfoundry.sh/getting-started/installation).

Then, you'll have to setup contracts development by running forge install in the contracts directory.

### Option 2: Project Template (Solidity Contracts for Onchain Verification)[​](https://docs.succinct.xyz/docs/sp1/getting-started/quickstart#option-2-project-template-solidity-contracts-for-onchain-verification)

If you want to use SP1 to generate proofs that will eventually be verified on an EVM chain, you should use the [SP1 project template](https://github.com/succinctlabs/sp1-project-template/tree/main). This Github template is scaffolded with a SP1 program, a script to generate proofs, and also a contracts folder that contains a Solidity contract that can verify SP1 proofs on any EVM chain.

Either fork the project template repository or clone it:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   git clone https://github.com/succinctlabs/sp1-project-template.git   `

### Project Overview[​](https://docs.succinct.xyz/docs/sp1/getting-started/quickstart#project-overview)

Your new project will have the following structure (ignoring the contracts folder, if you are using the project template):

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   .├── program│   ├── Cargo.lock│   ├── Cargo.toml│   └── src│       └── main.rs├── rust-toolchain└── script    ├── Cargo.lock    ├── Cargo.toml    ├── build.rs    └── src        └── bin            ├── prove.rs            └── vkey.rs6 directories, 4 files   `

There are 2 directories (each a crate) in the project:

*   program: the source code that will be proven inside the zkVM.
    
*   script: code that contains proof generation and verification code.
    

**We recommend you install the** [**rust-analyzer**](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) **extension.** Note that if you use cargo prove new inside a monorepo, you will need to add the manifest file to rust-analyzer.linkedProjects to get full IDE support.

Build[​](https://docs.succinct.xyz/docs/sp1/getting-started/quickstart#build)
-----------------------------------------------------------------------------

Before we can run the program inside the zkVM, it must be compiled to a RISC-V executable using the succinct Rust toolchain. This is called an [ELF (Executable and Linkable Format)](https://en.wikipedia.org/wiki/Executable_and_Linkable_Format). To compile the program, you can run the following command:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cd program && cargo prove build   `

which will generate an ELF file under target/elf-compilation.

Note: the build.rs file in the script directory will use run the above command automatically to build the ELF, meaning you don't have to manually run cargo prove build every time you make a change to the program!

Execute[​](https://docs.succinct.xyz/docs/sp1/getting-started/quickstart#execute)
---------------------------------------------------------------------------------

To test your program, you can first execute your program without generating a proof. In general this is helpful for iterating on your program and verifying that it is correct.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cd ../scriptRUST_LOG=info cargo run --release -- --execute   `

Prove[​](https://docs.succinct.xyz/docs/sp1/getting-started/quickstart#prove)
-----------------------------------------------------------------------------

When you are ready to generate a proof, you should run the script with the --prove flag that will generate a proof.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cd ../scriptRUST_LOG=info cargo run --release -- --prove   `

The output should show something like this:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   n: 202024-07-23T17:07:07.874856Z  INFO prove_core:collect_checkpoints: clk = 0 pc = 0x2017e82024-07-23T17:07:07.876264Z  INFO prove_core:collect_checkpoints: close time.busy=2.00ms time.idle=1.50µs2024-07-23T17:07:07.913304Z  INFO prove_core:shard: close time.busy=32.2ms time.idle=791ns2024-07-23T17:07:10.724280Z  INFO prove_core:commit: close time.busy=2.81s time.idle=1.25µs2024-07-23T17:07:10.725923Z  INFO prove_core:prove_checkpoint: clk = 0 pc = 0x2017e8     num=02024-07-23T17:07:10.729130Z  INFO prove_core:prove_checkpoint: close time.busy=3.68ms time.idle=1.17µs num=02024-07-23T17:07:14.648146Z  INFO prove_core: execution report (totals): total_cycles=9329, total_syscall_cycles=202024-07-23T17:07:14.648180Z  INFO prove_core: execution report (opcode counts):2024-07-23T17:07:14.648197Z  INFO prove_core:   1948 add...2024-07-23T17:07:14.648277Z  INFO prove_core: execution report (syscall counts):2024-07-23T17:07:14.648408Z  INFO prove_core:   8 commit...2024-07-23T17:07:14.648858Z  INFO prove_core: summary: cycles=9329, e2e=9.193968459, khz=1014.69, proofSize=14197802024-07-23T17:07:14.653193Z  INFO prove_core: close time.busy=9.20s time.idle=12.2µsSuccessfully generated proof!fib(n): 10946   `

The program by default is quite small, so proof generation will only take a few seconds locally. After it generates, the proof will be verified for correctness.

**Note:** When benchmarking proof generation times locally, it is important to note that there is a fixed overhead for proving, which means that the proof generation time for programs with a small number of cycles is not representative of the performance of larger programs (which often have better performance characteristics as the overhead is amortized across many cycles).

Recommended Workflow[​](https://docs.succinct.xyz/docs/sp1/getting-started/quickstart#recommended-workflow)
-----------------------------------------------------------------------------------------------------------

Please see the [Recommended Workflow](https://docs.succinct.xyz/docs/sp1/generating-proofs/recommended-workflow) section for more details on how to develop your SP1 program and generate proofs.

We _strongly recommend_ that developers who want to use SP1 for non-trivial programs generate proofs on the beta version of our [Prover Network](https://docs.succinct.xyz/docs/sp1/generating-proofs/prover-network). The prover network generates SP1 proofs across multiple machines, reducing latency and also runs SP1 on optimized hardware instances that result in faster + cheaper proof generation times.

We recommend that for any production benchmarking, you use the prover network to estimate latency and costs of proof generation. We also would love to chat with your team directly to help you get started with the prover network--please fill out this [form](https://partner.succinct.xyz/).

Project Template
================

Another option for getting started with SP1 is to use the [SP1 Project Template](https://github.com/succinctlabs/sp1-project-template/tree/main).

You can use this as a Github template to create a new repository that has a SP1 program, a script to generate proofs, and also a contracts folder that contains a Solidity contract that can verify SP1 proofs on any EVM chain.

Hardware Requirements

We recommend that developers who want to use SP1 for non-trivial programs generate proofs on our prover network. The prover network generates SP1 proofs across multiple machines, reducing latency and also runs SP1 on optimized hardware instances that result in faster + cheaper proof generation times.

We recommend that for any production benchmarking, you use the prover network to estimate latency and costs of proof generation.

Local Proving[​](https://docs.succinct.xyz/docs/sp1/getting-started/hardware-requirements#local-proving)
--------------------------------------------------------------------------------------------------------

If you want to generate SP1 proofs locally, this section has an overview of the hardware requirements required. These requires depend on which [types of proofs](https://docs.succinct.xyz/docs/sp1/generating-proofs/proof-types) you want to generate and can also change over time as the design of the zKVM evolves.

**The most important requirement is CPU for performance/latency and RAM to prevent running out of memory.**

Mock / NetworkCore / CompressGroth16 and PLONK (EVM)CPU1+, single-core perf matters16+, more is better16+, more is betterMemory8GB+, more is better16GB+, more if you have more cores16GB+, more is betterDisk10GB+10GB+10GB+EVM Compatible✅❌✅

### CPU[​](https://docs.succinct.xyz/docs/sp1/getting-started/hardware-requirements#cpu)

The execution & trace generation of the zkVM is mostly CPU bound, having a high single-core performance is recommended to accelerate these steps. The rest of the prover is mostly bound by hashing/field operations which can be parallelized with multiple cores.

### Memory[​](https://docs.succinct.xyz/docs/sp1/getting-started/hardware-requirements#memory)

Our prover requires keeping large matrices (i.e., traces) in memory to generate the proofs. Certain steps of the prover have a minimum memory requirement, meaning that if you have less than this amount of memory, the process will OOM.

This effect is most noticeable when using the Groth16 or PLONK provers. If you're running the Groth16 or Plonk provers locally on Mac or Windows using docker, you might need to increase the memory limit for [docker desktop](https://docs.docker.com/desktop/settings-and-maintenance/settings/#resources).

### Disk[​](https://docs.succinct.xyz/docs/sp1/getting-started/hardware-requirements#disk)

Disk is required to install the SP1 zkVM toolchain and to install the circuit artifacts, if you plan to locally build the Groth16 or PLONK provers.

Furthermore, disk is used to checkpoint the state of the program execution, which is required to generate the proofs.

Basics
======

The easiest way to understand how to write programs for the SP1 zkVM is to look at some examples.

Example: Fibonacci[​](https://docs.succinct.xyz/docs/sp1/writing-programs/basics#example-fibonacci)
---------------------------------------------------------------------------------------------------

This program is from the examples [directory](https://github.com/succinctlabs/sp1/tree/main/examples) in the SP1 repo which contains several example programs of varying complexity.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML``   //! A simple program that takes a number `n` as input, and writes the `n-1`th and `n`th fibonacci//! number as an output.// These two lines are necessary for the program to properly compile.//// Under the hood, we wrap your main function with some extra code so that it behaves properly// inside the zkVM.#![no_main]sp1_zkvm::entrypoint!(main);pub fn main() {    // Read an input to the program.    //    // Behind the scenes, this compiles down to a system call which handles reading inputs    // from the prover.    let n = sp1_zkvm::io::read::();    // Write n to public input    sp1_zkvm::io::commit(&n);    // Compute the n'th fibonacci number, using normal Rust code.    let mut a = 0;    let mut b = 1;    for _ in 0..n {        let mut c = a + b;        c %= 7919; // Modulus to prevent overflow.        a = b;        b = c;    }    // Write the output of the program.    //    // Behind the scenes, this also compiles down to a system call which handles writing    // outputs to the prover.    sp1_zkvm::io::commit(&a);    sp1_zkvm::io::commit(&b);}   ``

As you can see, writing programs is as simple as writing normal Rust.

After you've written your program, you must compile it to an ELF that the SP1 zkVM can prove. To read more about compiling programs, refer to the section on [Compiling Programs](https://docs.succinct.xyz/docs/sp1/writing-programs/compiling). To read more about how inputs and outputs work, refer to the section on [Inputs & Outputs](https://docs.succinct.xyz/docs/sp1/writing-programs/inputs-and-outputs).

Setup
=====

In this section, we will teach you how to setup a self-contained crate which can be compiled as a program that can be executed inside the zkVM.

Create Project with CLI (Recommended)[​](https://docs.succinct.xyz/docs/sp1/writing-programs/setup#create-project-with-cli-recommended)
---------------------------------------------------------------------------------------------------------------------------------------

The recommended way to setup your first program to prove inside the zkVM is using the method described in [Quickstart](https://docs.succinct.xyz/docs/sp1/getting-started/quickstart) which will create a program folder.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cargo prove new cd /program   `

Manual Project Setup[​](https://docs.succinct.xyz/docs/sp1/writing-programs/setup#manual-project-setup)
-------------------------------------------------------------------------------------------------------

You can also manually setup a project. First create a new Rust project using cargo:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cargo new programcd program   `

### Cargo Manifest[​](https://docs.succinct.xyz/docs/sp1/writing-programs/setup#cargo-manifest)

Inside this crate, add the sp1-zkvm crate as a dependency. Your Cargo.toml should look like the following:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   [workspace][package]version = "0.1.0"name = "program"edition = "2021"[dependencies]sp1-zkvm = "4.0.0"   `

The sp1-zkvm crate includes necessary utilities for your program, including handling inputs and outputs, precompiles, patches, and more.

### main.rs[​](https://docs.succinct.xyz/docs/sp1/writing-programs/setup#mainrs)

Inside the src/main.rs file, you must make sure to include these two lines to ensure that your program properly compiles to a valid SP1 program.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   #![no_main]sp1_zkvm::entrypoint!(main);   `

These two lines of code wrap your main function with some additional logic to ensure that your program compiles correctly with the RISC-V target.

Compiling Programs

Once you have written an SP1 program, you must compile it to an ELF file that can be executed in the zkVM. The cargo prove CLI tool (downloaded during installation) provides convenient commands for compiling SP1 programs.

Development Builds[​](https://docs.succinct.xyz/docs/sp1/writing-programs/compiling#development-builds)
-------------------------------------------------------------------------------------------------------

> WARNING: Running cargo prove build may not generate a reproducible ELF which is necessary for verifying that your binary corresponds to given source code.
> 
> Use SP1's [reproducible build system](https://docs.succinct.xyz/docs/sp1/writing-programs/compiling#production-builds) for production builds.

To build a program while developing, simply run the following command in the crate that contains your SP1 program:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   # Enter the directory containing your SP1 program.cd path/to/your/program# Build the program.cargo prove build   `

This will compile the ELF that can be executed in the zkVM. The output from the command will look similar to this:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML``   [sp1]     Compiling version_check v0.9.4[sp1]     Compiling proc-macro2 v1.0.86[sp1]     Compiling unicode-ident v1.0.12[sp1]     Compiling cfg-if v1.0.0...[sp1]     Compiling sp1-lib v1.0.1[sp1]     Compiling sp1-zkvm v1.0.1[sp1]     Compiling fibonacci-program v0.1.0 (/Users/username/Documents/fibonacci/program)[sp1]      Finished `release` profile [optimized] target(s) in 8.33s   ``

Under the hood, this CLI command calls cargo build with the riscv32im-succinct-zkvm-elf target and other required environment variables and flags. The logic for this command is defined in the [sp1-build](https://github.com/succinctlabs/sp1/tree/main/build) crate.

### Advanced Build Options[​](https://docs.succinct.xyz/docs/sp1/writing-programs/compiling#advanced-build-options)

The cargo prove build command supports several configuration options to customize the build process for your program:

*   \--features: Enable specific features
    
*   \--output-directory: Specify a custom output location for the ELF
    
*   \--elf-name: Set a custom name for the output ELF file
    
*   \--no-default-features: Disable default features
    
*   \--locked: Ensure Cargo.lock remains unchanged
    
*   \--packages: Build only specified packages
    
*   \--binaries: Build only specified binaries
    

Run cargo prove build --help to see the complete list of options. Some options mirror those available in the standard cargo build command.

Production Builds[​](https://docs.succinct.xyz/docs/sp1/writing-programs/compiling#production-builds)
-----------------------------------------------------------------------------------------------------

For production builds, use Docker to generate a **reproducible ELF** that will be identical across all platforms. Simply add the --docker flag to your build command. You can also specify a release version using --tag, otherwise the tag defaults to the latest release. For example:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cargo prove build --docker --tag v4.0.0   `

To verify that your build is truly reproducible across different platforms and systems, compute the SHA-512 hash of the generated ELF file. The hash should be identical regardless of where you build it:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   $ shasum -a 512 elf/riscv32im-succinct-zkvm-elff9afb8caaef10de9a8aad484c4dd3bfa54ba7218f3fc245a20e8a03ed40b38c617e175328515968aecbd3c38c47b2ca034a99e6dbc928512894f20105b03a203   `

Build Script[​](https://docs.succinct.xyz/docs/sp1/writing-programs/compiling#build-script)
-------------------------------------------------------------------------------------------

If you want your program crate to be built automatically whenever you build/run your script crate, you can add a build.rs file inside of script/ (at the same level as Cargo.toml of your script crate) that utilizes the sp1-build crate:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   fn main() {    sp1_build::build_program("../program");}   `

The path passed in to build\_program should point to the directory containing the Cargo.toml file for your program. Make sure to also add sp1-build as a build dependency in script/Cargo.toml:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   [build-dependencies]sp1-build = "4.0.0"   `

You will see output like the following from the build script if the program has changed, indicating that the program was rebuilt:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   [fibonacci-script 0.1.0] cargo:rerun-if-changed=../program/src[fibonacci-script 0.1.0] cargo:rerun-if-changed=../program/Cargo.toml[fibonacci-script 0.1.0] cargo:rerun-if-changed=../program/Cargo.lock[fibonacci-script 0.1.0] cargo:warning=fibonacci-program built at 2024-03-02 22:01:26[fibonacci-script 0.1.0] [sp1]    Compiling fibonacci-program v0.1.0 (/Users/umaroy/Documents/fibonacci/program)[fibonacci-script 0.1.0] [sp1]     Finished release [optimized] target(s) in 0.15swarning: fibonacci-script@0.1.0: fibonacci-program built at 2024-03-02 22:01:26   `

The above output was generated by running RUST\_LOG=info cargo run --release -vv for the script folder of the Fibonacci example.

### Advanced Build Options[​](https://docs.succinct.xyz/docs/sp1/writing-programs/compiling#advanced-build-options-1)

To configure the build process when using the sp1-build crate, you can pass a [BuildArgs](https://docs.rs/sp1-build/latest/sp1_build/struct.BuildArgs.html) struct to to the [build\_program\_with\_args](https://docs.rs/sp1-build/latest/sp1_build/fn.build_program_with_args.html) function. The build arguments are the same as the ones available from the cargo prove build command.

As an example, you could use the following code to build the Fibonacci example with the docker flag set to true and a custom name for the generated ELF. This will generate a reproducible ELF file (with Docker) with the name fibonacci-elf:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   use sp1_build::{build_program_with_args, BuildArgs};fn main() {    let args = BuildArgs {        docker: true,        elf_name: "fibonacci-elf".to_string(),        ..Default::default()    };    build_program_with_args("../program", &args);}   `

Inputs and Outputs

In real world applications of zero-knowledge proofs, you almost always want to verify your proof in the context of some inputs and outputs. For example:

*   **Rollups**: Given a list of transactions, prove the new state of the blockchain.
    
*   **Coprocessors**: Given a block header, prove the historical state of some storage slot inside a smart contract.
    
*   **Attested Images**: Given a signed image, prove that you made a restricted set of image transformations.
    

In this section, we cover how you pass inputs and outputs to the zkVM and create new types that support serialization.

Reading Data[​](https://docs.succinct.xyz/docs/sp1/writing-programs/inputs-and-outputs#reading-data)
----------------------------------------------------------------------------------------------------

Data that is read is not public to the verifier by default. Use the sp1\_zkvm::io::read:: method:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   let a = sp1_zkvm::io::read::();let b = sp1_zkvm::io::read::();let c = sp1_zkvm::io::read::();   `

Note that T must implement the serde::Serialize and serde::Deserialize trait. If you want to read bytes directly, you can also use the sp1\_zkvm::io::read\_vec method. read\_vec does not perform serialization and is substantially faster for reading in bytes directly.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   let my_vec = sp1_zkvm::io::read_vec();   `

Committing Data[​](https://docs.succinct.xyz/docs/sp1/writing-programs/inputs-and-outputs#committing-data)
----------------------------------------------------------------------------------------------------------

Committing to data makes the data public to the verifier. Use the sp1\_zkvm::io::commit:: method:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   sp1_zkvm::io::commit::(&a);sp1_zkvm::io::commit::(&b);sp1_zkvm::io::commit::(&c);   `

Note that T must implement the Serialize and Deserialize trait. If you want to write bytes directly, you can also use sp1\_zkvm::io::commit\_slice method:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   let mut my_slice = [0_u8; 32];sp1_zkvm::io::commit_slice(&my_slice);   `

Creating Serializable Types[​](https://docs.succinct.xyz/docs/sp1/writing-programs/inputs-and-outputs#creating-serializable-types)
----------------------------------------------------------------------------------------------------------------------------------

Typically, you can implement the Serialize and Deserialize traits using a simple derive macro on a struct.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   use serde::{Serialize, Deserialize};#[derive(Serialize, Deserialize)]struct MyStruct {    a: u32,    b: u64,    c: String}   `

For more complex usecases, refer to the [Serde docs](https://serde.rs/).

Example[​](https://docs.succinct.xyz/docs/sp1/writing-programs/inputs-and-outputs#example)
------------------------------------------------------------------------------------------

Here is a basic example of using inputs and outputs with more complex types.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   #![no_main]sp1_zkvm::entrypoint!(main);use serde::{Deserialize, Serialize};#[derive(Serialize, Deserialize, Debug, PartialEq)]struct MyPointUnaligned {    pub x: usize,    pub y: usize,    pub b: bool,}pub fn main() {    let p1 = sp1_zkvm::io::read::();    println!("Read point: {:?}", p1);    let p2 = sp1_zkvm::io::read::();    println!("Read point: {:?}", p2);    let p3: MyPointUnaligned = MyPointUnaligned { x: p1.x + p2.x, y: p1.y + p2.y, b: p1.b && p2.b };    println!("Addition of 2 points: {:?}", p3);    sp1_zkvm::io::commit(&p3);}   `

Patched Crates

We maintain forks of commonly used libraries in blockchain infrastructure to significantly accelerate the execution of certain operations. Under the hood, we use [precompiles](https://docs.succinct.xyz/docs/sp1/writing-programs/precompiles) to achieve tremendous performance improvements in proof generation time.

**If you know of a library or library version that you think should be patched, please open an issue or a pull request!**

Supported Libraries[​](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates#supported-libraries)
--------------------------------------------------------------------------------------------------------------

Crate NameRepositoryNotesVersionssha2[sp1-patches/RustCrypto-hashes](https://github.com/sp1-patches/RustCrypto-hashes)sha2560.10.6, 0.10.8sha3[sp1-patches/RustCrypto-hashes](https://github.com/sp1-patches/RustCrypto-hashes)keccak2560.10.8bigint[sp1-patches/RustCrypto-bigint](https://github.com/sp1-patches/RustCrypto-bigint)bigint0.5.5tiny-keccak[sp1-patches/tiny-keccak](https://github.com/sp1-patches/tiny-keccak)keccak2562.0.2curve25519-dalek[sp1-patches/curve25519-dalek](https://github.com/sp1-patches/curve25519-dalek)ed25519 verify4.1.3, 3.2.0curve25519-dalek-ng[sp1-patches/curve25519-dalek-ng](https://github.com/sp1-patches/curve25519-dalek-ng)ed25519 verify4.1.1ed25519-consensus[sp1-patches/ed25519-consensus](http://github.com/sp1-patches/ed25519-consensus)ed25519 verify2.1.0ed25519-dalek[sp1-patches/ed25519-dalek](http://github.com/sp1-patches/ed25519-dalek)ed25519 verify1.0.1ecdsa-core[sp1-patches/signatures](http://github.com/sp1-patches/signatures)secp256k1 verify0.16.8, 0.16.9secp256k1[sp1-patches/rust-secp256k1](http://github.com/sp1-patches/rust-secp256k1)secp256k1 verify0.29.0, 0.29.1substrate-bn[sp1-patches/bn](https://github.com/sp1-patches/bn)BN2540.6.0bls12\_381[sp1-patches/bls12\_381](https://github.com/sp1-patches/bls12_381)BLS12-3810.8.0

Using Patched Crates[​](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates#using-patched-crates)
----------------------------------------------------------------------------------------------------------------

To use the patched libraries, you can use corresponding patch entries in your program's Cargo.toml such as:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   [patch.crates-io]# SHA2sha2-v0-9-9 = { git = "https://github.com/sp1-patches/RustCrypto-hashes", package = "sha2", tag = "patch-sha2-0.9.9-sp1-4.0.0" }sha2-v0-10-6 = { git = "https://github.com/sp1-patches/RustCrypto-hashes", package = "sha2", tag = "patch-sha2-0.10.6-sp1-4.0.0" }sha2-v0-10-8 = { git = "https://github.com/sp1-patches/RustCrypto-hashes", package = "sha2", tag = "patch-sha2-0.10.8-sp1-4.0.0" }# SHA3sha3-v0-10-8 = { git = "https://github.com/sp1-patches/RustCrypto-hashes", package = "sha3", tag = "patch-sha3-0.10.8-sp1-4.0.0" }# BigIntcrypto-bigint = { git = "https://github.com/sp1-patches/RustCrypto-bigint", tag = "patch-0.5.5-sp1-4.0.0" }# Keccaktiny-keccak = { git = "https://github.com/sp1-patches/tiny-keccak", tag = "patch-2.0.2-sp1-4.0.0" }# Ed25519curve25519-dalek = { git = "https://github.com/sp1-patches/curve25519-dalek", tag = "patch-4.1.3-sp1-4.0.0" }curve25519-dalek-ng = { git = "https://github.com/sp1-patches/curve25519-dalek-ng", tag = "patch-4.1.1-sp1-4.0.0" }# ECDSAk256 = { git = "https://github.com/sp1-patches/elliptic-curves", tag = "patch-k256-13.4-sp1-4.1.0" }p256 = { git = "https://github.com/sp1-patches/elliptic-curves", tag = "patch-p256-13.2-sp1-4.1.0" }secp256k1 = { git = "https://github.com/sp1-patches/rust-secp256k1", tag = "patch-0.29.1-sp1-4.0.0" }# BN254substrate-bn = { git = "https://github.com/sp1-patches/bn", tag = "patch-0.6.0-sp1-4.0.0" }# BLS12-381bls12_381 = { git = "https://github.com/sp1-patches/bls12_381", tag = "patch-0.8.0-sp1-4.0.0", features = ["groups"] }# RSArsa = { git = "https://github.com/sp1-patches/RustCrypto-RSA/", tag = "patch-0.9.6-sp1-4.0.0" }   `

If you are patching a crate from Github instead of from crates.io, you need to specify the repository in the patch section. For example:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   [patch."https://github.com/RustCrypto/hashes"]sha3 = { git = "https://github.com/sp1-patches/RustCrypto-hashes", package = "sha3", tag = "patch-sha3-0.10.8-sp1-4.0.0"  }   `

An example of using patched crates is available in [SP1 Blobstream](https://github.com/succinctlabs/sp1-blobstream/blob/89e058052c0b691898c5b56a62a6fa0270b31627/Cargo.toml#L40-L43).

Ed25519 Acceleration[​](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates#ed25519-acceleration)
----------------------------------------------------------------------------------------------------------------

To accelerate Ed25519 operations, you'll need to patch crates depending on if you're using the ed25519-consensus or ed25519-dalek library in your program or dependencies.

Generally, ed25519-consensus has better performance for Ed25519 operations than ed25519-dalek by a factor of 2.

### Patches[​](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates#patches)

Apply the following patches based on what crates are in your dependencies.

*   If using ed25519-consensus, you should patch curve25519-dalek-ng to accelerate ed25519 operations:curve25519-dalek-ng = { git = "https://github.com/sp1-patches/curve25519-dalek-ng", tag = "patch-4.1.1-sp1-4.0.0" }
    
*   If using ed25519-dalek version 2.1, you should patch curve25519-dalek to accelerate ed25519 operations:curve25519-dalek = { git = "https://github.com/sp1-patches/curve25519-dalek", tag = "patch-4.1.3-sp1-4.0.0" }
    

Secp256k1 Acceleration[​](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates#secp256k1-acceleration)
--------------------------------------------------------------------------------------------------------------------

To accelerate Secp256k1 operations, you'll need to patch k256 or secp256k1 depending on your usage.

Generally, if a crate you're using (ex. revm) has support for using k256 instead of secp256k1, you should use k256.

### Patches[​](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates#patches-1)

Apply the following patches based on what crates are in your dependencies.

*   ecdsa-core = { git = "https://github.com/sp1-patches/signatures", package = "ecdsa", tag = "patch-0.16.9-sp1-4.0.0" }Note: The curve operations for k256 are inside of the ecdsa-core crate, so you don't need to patch k256 itself, and just patching ecdsa-core is enough.
    
*   secp256k1 = { git = "https://github.com/sp1-patches/rust-secp256k1", tag = "patch-0.29.1-sp1-4.0.0" }ecdsa-core = { git = "https://github.com/sp1-patches/signatures", package = "ecdsa", tag = "patch-0.16.9-sp1-4.0.0" }
    

While secp256k1 doesnt usually rely on ecdsa-core the patched version does, so you must patch it as well.

Secp256r1 Acceleration[​](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates#secp256r1-acceleration)
--------------------------------------------------------------------------------------------------------------------

*   ecdsa-core = { git = "https://github.com/sp1-patches/signatures", package = "ecdsa", tag = "patch-0.16.9-sp1-4.0.0" }
    

### Notes[​](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates#notes)

*   The curve operations for p256 are inside of the ecdsa-core crate, so you don't need to patch p256 itself, and just patching ecdsa-core is enough.
    
*   The current patch only accelerates the ecrecover function. In a future release, we will accelerate the verify function used in P256Verify (RIP-7212 precompile).
    

BN254 Acceleration[​](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates#bn254-acceleration)
------------------------------------------------------------------------------------------------------------

To accelerate BN254 (Also known as BN128 and Alt-BN128), you will need to patch the substrate-bn crate.

### Patches[​](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates#patches-2)

Apply the patch by adding the following to your list of dependencies:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   substrate-bn = { git = "https://github.com/sp1-patches/bn", tag = "patch-0.6.0-sp1-4.0.0" }   `

### Performance Benchmarks for Patched substrate-bn in revm[​](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates#performance-benchmarks-for-patched-substrate-bn-in-revm)

OperationStandard substrate-bn CyclesPatched substrate-bn CyclesTimes Fasterrun-add170,298111,6151.52run-mul1,860,836243,8307.64run-pair255,627,62511,528,50322.15

Note: The operations run-add, run-mul, and run-pair are from the revm crate, specifically from the file crates/precompile/src/bn128.rs on GitHub. In the patched version of the substrate-bn crate, these functions utilize SP1's BN254 Fp precompiles.

To accelerate [revm](https://github.com/bluealloy/revm) in SP1 using the BN254 patched crate, replace the substrate-bn crate with the patched crate by adding the following to crates/precompile/Cargo.toml:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   bn = { git = "https://github.com/sp1-patches/bn", package = "substrate-bn", tag = "patch-0.6.0-sp1-4.0.0" }   `

BLS12-381 Acceleration[​](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates#bls12-381-acceleration)
--------------------------------------------------------------------------------------------------------------------

To accelerate BLS12-381 operations, you'll need to patch the bls12\_381 crate. Apply the following patch by adding the following to your list of dependencies:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   bls12_381 = { git = "https://github.com/sp1-patches/bls12_381", tag = "patch-0.8.0-sp1-4.0.0" }   `

This patch significantly improves the performance of BLS12-381 operations, making it essential for applications that rely heavily on these cryptographic primitives.

### Performance Benchmarks for Patched bls12\_381 in [kzg-rs](https://github.com/succinctlabs/kzg-rs)[​](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates#performance-benchmarks-for-patched-bls12_381-in-kzg-rs)

TestUnpatched CyclesPatched CyclesImprovement (x faster)Verify blob KZG proof265,322,93427,166,1739.77xVerify blob KZG proof batch (10 blobs)1,228,277,089196,571,5786.25xEvaluate polynomial in evaluation form90,717,71159,370,5561.53xCompute challenge63,400,51157,341,5321.11xVerify KZG proof212,708,5979,390,64022.65x

Troubleshooting[​](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates#troubleshooting)
------------------------------------------------------------------------------------------------------

### Verifying Patch Usage: Cargo[​](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates#verifying-patch-usage-cargo)

You can check if the patch was applied by using cargo's tree command to print the dependencies of the crate you patched.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cargo tree -p sha2@0.10.8   `

Next to the package name, it should have a link to the Github repository that you patched with.

Ex.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   sha2 v0.10.8 (https://github.com/sp1-patches/RustCrypto-hashes?tag=patch-sha2-0.10.8-sp1-4.0.0)├── ...   `

### Verifying Patch Usage: SP1[​](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates#verifying-patch-usage-sp1)

To check if a precompile is used by your program, you can view SP1's ExecutionReport, which is returned when executing a program with execute. In ExecutionReport you can view the syscall\_counts map to view if a specific syscall was used.

For example, if you wanted to check sha256 was used, you would look for SHA\_EXTEND and SHA\_COMPRESS in syscall\_counts.

An example of this is available in our [Patch Testing Example](https://github.com/succinctlabs/sp1/blob/dd032eb23949828d244d1ad1f1569aa78155837c/examples/patch-testing/script/src/main.rs).

### Cargo Version Issues[​](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates#cargo-version-issues)

If you encounter issues with version commits on your patches, you should try updating the patched crate manually.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`cargo update -p` 

If you encounter issues relating to cargo / git, you can try setting CARGO\_NET\_GIT\_FETCH\_WITH\_CLI:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`CARGO_NET_GIT_FETCH_WITH_CLI=true cargo update -p` 

You can permanently set this value in ~/.cargo/config:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   [net]git-fetch-with-cli = true   `

Precompiles
===========

Precompiles are built into the SP1 zkVM and accelerate commonly used operations such as elliptic curve arithmetic and hashing. Under the hood, precompiles are implemented as custom STARK tables dedicated to proving one or few operations. **They typically improve the performance of executing expensive operations in SP1 by a few orders of magnitude.**

Inside the zkVM, precompiles are exposed as system calls executed through the ecall RISC-V instruction. Each precompile has a unique system call number and implements an interface for the computation.

SP1 also has been designed specifically to make it easy for external contributors to create and extend the zkVM with their own precompiles. To learn more about this, you can look at implementations of existing precompiles in the [precompiles](https://github.com/succinctlabs/sp1/tree/main/crates/core/executor/src/events/precompiles) folder. More documentation on this will be coming soon.

**To use precompiles, we typically recommend you interact with them through** [**patches**](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates)**, which are crates modified to use these precompiles under the hood, without requiring you to call system calls directly.**

Specification[​](https://docs.succinct.xyz/docs/sp1/writing-programs/precompiles#specification)
-----------------------------------------------------------------------------------------------

If you are an advanced user you can interact with the precompiles directly using external system calls.

Here is a list of all available system calls & precompiles.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML``   //! Syscalls for the SP1 zkVM.//!//! Documentation for these syscalls can be found in the zkVM entrypoint//! `sp1_zkvm::syscalls` module.pub mod bls12381;pub mod bn254;#[cfg(feature = "ecdsa")]pub mod ecdsa;pub mod ed25519;pub mod io;pub mod secp256k1;pub mod secp256r1;pub mod unconstrained;pub mod utils;#[cfg(feature = "verify")]pub mod verify;extern "C" {    /// Halts the program with the given exit code.    pub fn syscall_halt(exit_code: u8) -> !;    /// Writes the bytes in the given buffer to the given file descriptor.    pub fn syscall_write(fd: u32, write_buf: *const u8, nbytes: usize);    /// Reads the bytes from the given file descriptor into the given buffer.    pub fn syscall_read(fd: u32, read_buf: *mut u8, nbytes: usize);    /// Executes the SHA-256 extend operation on the given word array.    pub fn syscall_sha256_extend(w: *mut [u32; 64]);    /// Executes the SHA-256 compress operation on the given word array and a given state.    pub fn syscall_sha256_compress(w: *mut [u32; 64], state: *mut [u32; 8]);    /// Executes an Ed25519 curve addition on the given points.    pub fn syscall_ed_add(p: *mut [u32; 16], q: *const [u32; 16]);    /// Executes an Ed25519 curve decompression on the given point.    pub fn syscall_ed_decompress(point: &mut [u8; 64]);    /// Executes an Sepc256k1 curve addition on the given points.    pub fn syscall_secp256k1_add(p: *mut [u32; 16], q: *const [u32; 16]);    /// Executes an Secp256k1 curve doubling on the given point.    pub fn syscall_secp256k1_double(p: *mut [u32; 16]);    /// Executes an Secp256k1 curve decompression on the given point.    pub fn syscall_secp256k1_decompress(point: &mut [u8; 64], is_odd: bool);    /// Executes an Secp256r1 curve addition on the given points.    pub fn syscall_secp256r1_add(p: *mut [u32; 16], q: *const [u32; 16]);    /// Executes an Secp256r1 curve doubling on the given point.    pub fn syscall_secp256r1_double(p: *mut [u32; 16]);    /// Executes an Secp256r1 curve decompression on the given point.    pub fn syscall_secp256r1_decompress(point: &mut [u8; 64], is_odd: bool);    /// Executes a Bn254 curve addition on the given points.    pub fn syscall_bn254_add(p: *mut [u32; 16], q: *const [u32; 16]);    /// Executes a Bn254 curve doubling on the given point.    pub fn syscall_bn254_double(p: *mut [u32; 16]);    /// Executes a BLS12-381 curve addition on the given points.    pub fn syscall_bls12381_add(p: *mut [u32; 24], q: *const [u32; 24]);    /// Executes a BLS12-381 curve doubling on the given point.    pub fn syscall_bls12381_double(p: *mut [u32; 24]);    /// Executes the Keccak-256 permutation on the given state.    pub fn syscall_keccak_permute(state: *mut [u64; 25]);    /// Executes an uint256 multiplication on the given inputs.    pub fn syscall_uint256_mulmod(x: *mut [u32; 8], y: *const [u32; 8]);    /// Executes a 256-bit by 2048-bit multiplication on the given inputs.    pub fn syscall_u256x2048_mul(        x: *const [u32; 8],        y: *const [u32; 64],        lo: *mut [u32; 64],        hi: *mut [u32; 8],    );    /// Enters unconstrained mode.    pub fn syscall_enter_unconstrained() -> bool;    /// Exits unconstrained mode.    pub fn syscall_exit_unconstrained();    /// Defers the verification of a valid SP1 zkVM proof.    pub fn syscall_verify_sp1_proof(vk_digest: &[u32; 8], pv_digest: &[u8; 32]);    /// Returns the length of the next element in the hint stream.    pub fn syscall_hint_len() -> usize;    /// Reads the next element in the hint stream into the given buffer.    pub fn syscall_hint_read(ptr: *mut u8, len: usize);    /// Allocates a buffer aligned to the given alignment.    pub fn sys_alloc_aligned(bytes: usize, align: usize) -> *mut u8;    /// Decompresses a BLS12-381 point.    pub fn syscall_bls12381_decompress(point: &mut [u8; 96], is_odd: bool);    /// Computes a big integer operation with a modulus.    pub fn sys_bigint(        result: *mut [u32; 8],        op: u32,        x: *const [u32; 8],        y: *const [u32; 8],        modulus: *const [u32; 8],    );    /// Executes a BLS12-381 field addition on the given inputs.    pub fn syscall_bls12381_fp_addmod(p: *mut u32, q: *const u32);    /// Executes a BLS12-381 field subtraction on the given inputs.    pub fn syscall_bls12381_fp_submod(p: *mut u32, q: *const u32);    /// Executes a BLS12-381 field multiplication on the given inputs.    pub fn syscall_bls12381_fp_mulmod(p: *mut u32, q: *const u32);    /// Executes a BLS12-381 Fp2 addition on the given inputs.    pub fn syscall_bls12381_fp2_addmod(p: *mut u32, q: *const u32);    /// Executes a BLS12-381 Fp2 subtraction on the given inputs.    pub fn syscall_bls12381_fp2_submod(p: *mut u32, q: *const u32);    /// Executes a BLS12-381 Fp2 multiplication on the given inputs.    pub fn syscall_bls12381_fp2_mulmod(p: *mut u32, q: *const u32);    /// Executes a BN254 field addition on the given inputs.    pub fn syscall_bn254_fp_addmod(p: *mut u32, q: *const u32);    /// Executes a BN254 field subtraction on the given inputs.    pub fn syscall_bn254_fp_submod(p: *mut u32, q: *const u32);    /// Executes a BN254 field multiplication on the given inputs.    pub fn syscall_bn254_fp_mulmod(p: *mut u32, q: *const u32);    /// Executes a BN254 Fp2 addition on the given inputs.    pub fn syscall_bn254_fp2_addmod(p: *mut u32, q: *const u32);    /// Executes a BN254 Fp2 subtraction on the given inputs.    pub fn syscall_bn254_fp2_submod(p: *mut u32, q: *const u32);    /// Executes a BN254 Fp2 multiplication on the given inputs.    pub fn syscall_bn254_fp2_mulmod(p: *mut u32, q: *const u32);    /// Reads a buffer from the input stream.    pub fn read_vec_raw() -> ReadVecResult;}#[repr(C)]pub struct ReadVecResult {    pub ptr: *mut u8,    pub len: usize,    pub capacity: usize,}   ``

Proof Aggregation

Overview[​](https://docs.succinct.xyz/docs/sp1/writing-programs/proof-aggregation#overview)
-------------------------------------------------------------------------------------------

SP1 supports proof aggregation and recursion, which allows you to verify an SP1 proof within SP1. Use cases include:

*   Reducing on-chain verification costs by aggregating multiple SP1 proofs into a single SP1 proof.
    
*   Proving logic that is split into multiple proofs, such as proving a statement about a rollup's state transition function by proving each block individually and aggregating these proofs to produce a final proof of a range of blocks.
    

**For an example of how to use proof aggregation and recursion in SP1, refer to the** [**aggregation example**](https://github.com/succinctlabs/sp1/blob/main/examples/aggregation/script/src/main.rs)**.**

Note that to verify an SP1 proof inside SP1, you must generate a "compressed" SP1 proof (see [Proof Types](https://docs.succinct.xyz/docs/sp1/generating-proofs/proof-types) for more details).

### When should SP1 proof aggregation be used?[​](https://docs.succinct.xyz/docs/sp1/writing-programs/proof-aggregation#when-should-sp1-proof-aggregation-be-used)

Note that by itself, SP1 can already prove arbitrarily large programs by chunking the program's execution into multiple "shards" (contiguous batches of cycles) and generating proofs for each shard in parallel, and then recursively aggregating the proofs. Thus, aggregation is generally **not necessary** for most use-cases, as SP1's proving for large programs is already parallelized.

However, aggregation can be useful in two specific cases:

1.  When your computation requires more than the zkVM's limited (~2GB) memory.
    
2.  When you want to combine multiple SP1 proofs from different parties into a single proof to reduce on-chain verification costs.
    

Verifying Proofs inside the zkVM[​](https://docs.succinct.xyz/docs/sp1/writing-programs/proof-aggregation#verifying-proofs-inside-the-zkvm)
-------------------------------------------------------------------------------------------------------------------------------------------

To verify a proof inside the zkVM, you can use the sp1\_zkvm::lib::verify::verify\_sp1\_proof function.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   sp1_zkvm::lib::verify::verify_sp1_proof(vkey, public_values_digest);   `

**You do not need to pass in the proof as input into the syscall, as the proof will automatically be read for the proof input stream by the prover.**

Note that you must include the verify feature in your Cargo.toml for sp1-zkvm to be able to use the verify\_proof function (like [this](https://github.com/succinctlabs/sp1/blob/main/examples/aggregation/program/Cargo.toml#L11)).

Generating Proofs with Aggregation[​](https://docs.succinct.xyz/docs/sp1/writing-programs/proof-aggregation#generating-proofs-with-aggregation)
-----------------------------------------------------------------------------------------------------------------------------------------------

To provide an existing proof as input to the SP1 zkVM, you can write a proof and verifying key to a SP1Stdin object, which is already used for all inputs to the zkVM.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   # Generating proving key and verifying key.let (input_pk, input_vk) = client.setup(PROOF_INPUT_ELF);let (aggregation_pk, aggregation_vk) = client.setup(AGGREGATION_ELF);// Generate a proof that will be recursively verified / aggregated. Note that we use the "compressed"// proof type, which is necessary for aggregation.let mut stdin = SP1Stdin::new();let input_proof = client    .prove(&input_pk, stdin)    .compressed()    .run()    .expect("proving failed");// Create a new stdin object to write the proof and the corresponding verifying key to.let mut stdin = SP1Stdin::new();stdin.write_proof(input_proof, input_vk);// Generate a proof that will recursively verify / aggregate the input proof.let aggregation_proof = client    .prove(&aggregation_pk, stdin)    .compressed()    .run()    .expect("proving failed");   `

Cycle Tracking

When writing a program, it is useful to know how many RISC-V cycles a portion of the program takes to identify potential performance bottlenecks. SP1 provides a way to track the number of cycles spent in a portion of the program.

Tracking Cycles[​](https://docs.succinct.xyz/docs/sp1/writing-programs/cycle-tracking#tracking-cycles)
------------------------------------------------------------------------------------------------------

### Using Print Annotations[​](https://docs.succinct.xyz/docs/sp1/writing-programs/cycle-tracking#using-print-annotations)

For simple debugging, use these annotations to log cycle counts to stdout:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   #![no_main]sp1_zkvm::entrypoint!(main);fn main() {     let mut nums = vec![1, 1];     // Compute the sum of the numbers.     println!("cycle-tracker-start: compute");     let sum: u64 = nums.iter().sum();     println!("cycle-tracker-end: compute");}   `

With this code, you will see output like the following in your logs:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   [INFO] compute: 1234 cycles   `

### Using Report Annotations[​](https://docs.succinct.xyz/docs/sp1/writing-programs/cycle-tracking#using-report-annotations)

To store cycle counts across multiple invocations in the ExecutionReport, use the report annotations:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   #![no_main]sp1_zkvm::entrypoint!(main);fn main() {    // Track cycles across multiple computations    for i in 0..10 {        println!("cycle-tracker-report-start: compute");        expensive_computation(i);        println!("cycle-tracker-report-end: compute");    }}   `

Access total cycles from all invocations

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   let report = client.execute(ELF, &stdin).run().unwrap();let total_compute_cycles = report.cycle_tracker.get("compute").unwrap();   `

### Using the Cycle Tracker Macro[​](https://docs.succinct.xyz/docs/sp1/writing-programs/cycle-tracking#using-the-cycle-tracker-macro)

Add sp1-derive to your dependencies:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   sp1-derive = "4.0.0"   `

Then annotate your functions:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   #[sp1_derive::cycle_tracker]pub fn expensive_function(x: usize) -> usize {    let mut y = 1;    for _ in 0..100 {        y *= x;        y %= 7919;    }    y}   `

Profiling a zkVM program[​](https://docs.succinct.xyz/docs/sp1/writing-programs/cycle-tracking#profiling-a-zkvm-program)
------------------------------------------------------------------------------------------------------------------------

Profiling a zkVM program produces a useful visualization ([example profile](https://share.firefox.dev/3Om1pzz)) which makes it easy to examine program performance and see exactly where VM cycles are being spent without needing to modify the program at all.

To profile a program, you need to:

1.  Enable the profiling feature for sp1-sdk in script/Cargo.toml
    
2.  Set the env variable TRACE\_FILE=trace.json and then call ProverClient::execute() in your script.
    

If you're executing a larger program (>100M cycles), you should set TRACE\_SAMPLE\_RATE to reduce the size of the trace file. A sample rate of 1000 means that 1 in every 1000 VM cycles is sampled. By default, every cycle is sampled.

Many examples can be found in the repo, such as this ['fibonacci'](https://github.com/succinctlabs/sp1/blob/dev/examples/fibonacci/script/src/main.rs#L22) script.

Once you have your script it should look like the following:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML    ``// Execute the program using the `ProverClient.execute` method, without generating a proof.    let (_, report) = client.execute(ELF, &stdin).run().unwrap();``

As well you must enable the profiling feature on the SDK:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML    `sp1-sdk = { version = "4.0.0", features = ["profiling"] }`

The TRACE\_FILE env var tells the executor where to save the profile, and the TRACE\_SAMPLE\_RATE env var tells the executor how often to sample the program. A larger sample rate will give you a smaller profile, it is the number of instructions in between each sample.

The full command to profile should look something like this

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML    `TRACE_FILE=output.json TRACE_SAMPLE_RATE=100 cargo run ...`

To view these profiles, we recommend [Samply](https://github.com/mstange/samply).

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML    `cargo install --locked samply    samply load output.json`

Basics
======

All the methods you'll need for generating proofs are included in the sp1\_sdk crate. Most importantly, you'll need to use the ProverClient to setup a proving key and verifying key for your program and then use the execute, prove and verify methods to execute your program, and generate and verify proofs.

To make this more concrete, let's walk through a simple example of generating a proof for a Fibonacci program inside the zkVM.

Example: Fibonacci[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/basics#example-fibonacci)
----------------------------------------------------------------------------------------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML``   use sp1_sdk::{include_elf, utils, ProverClient, SP1ProofWithPublicValues, SP1Stdin};/// The ELF we want to execute inside the zkVM.const ELF: &[u8] = include_elf!("fibonacci-program");fn main() {    // Setup logging.    utils::setup_logger();    // Create an input stream and write '500' to it.    let n = 1000u32;    // The input stream that the program will read from using `sp1_zkvm::io::read`. Note that the    // types of the elements in the input stream must match the types being read in the program.    let mut stdin = SP1Stdin::new();    stdin.write(&n);    // Create a `ProverClient` method.    let client = ProverClient::from_env();    // Execute the program using the `ProverClient.execute` method, without generating a proof.    let (_, report) = client.execute(ELF, &stdin).run().unwrap();    println!("executed program with {} cycles", report.total_instruction_count());    // Generate the proof for the given program and input.    let (pk, vk) = client.setup(ELF);    let mut proof = client.prove(&pk, &stdin).compressed().run().unwrap();    println!("generated proof");    // Read and verify the output.    //    // Note that this output is read from values committed to in the program using    // `sp1_zkvm::io::commit`.    let _ = proof.public_values.read::();    let a = proof.public_values.read::();    let b = proof.public_values.read::();    println!("a: {}", a);    println!("b: {}", b);    // Verify proof and public values    client.verify(&proof, &vk).expect("verification failed");    // Test a round trip of proof serialization and deserialization.    proof.save("proof-with-pis.bin").expect("saving proof failed");    let deserialized_proof =        SP1ProofWithPublicValues::load("proof-with-pis.bin").expect("loading proof failed");    // Verify the deserialized proof.    client.verify(&deserialized_proof, &vk).expect("verification failed");    println!("successfully generated and verified proof for the program!")}   ``

You can run the above script in the script directory with RUST\_LOG=info cargo run --release. Note that running the above script will generate a proof locally.

Setup

In this section, we will teach you how to setup a self-contained crate which can generate proofs of programs that have been compiled with the SP1 toolchain inside the SP1 zkVM, using the sp1-sdk crate.

CLI (Recommended)[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/setup#cli-recommended)
------------------------------------------------------------------------------------------------

The recommended way to setup your first program to prove inside the zkVM is using the method described in [Quickstart](https://docs.succinct.xyz/docs/sp1/getting-started/quickstart) which will create a script folder.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cargo prove new cd script   `

Manual[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/setup#manual)
----------------------------------------------------------------------------

You can also manually setup a project. First create a new cargo project:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cargo new scriptcd script   `

#### Cargo Manifest[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/setup#cargo-manifest)

Inside this crate, add the sp1-sdk crate as a dependency. Your Cargo.toml should look like as follows:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   [workspace][package]version = "0.1.0"name = "script"edition = "2021"[dependencies]sp1-sdk = "4.0.0"   `

The sp1-sdk crate includes the necessary utilities to generate, save, and verify proofs.

Proof Types

There are a few different types of proofs that can be generated by the SP1 zkVM. Each proof type has its own tradeoffs in terms of proof generation time, verification cost, and proof size.

The ProverClient follows a "builder" pattern that allows you to configure the proof type and other options after creating a ProverClient and calling prove on it.

For a full list of options, see the following [docs](https://docs.rs/sp1-sdk/latest/sp1_sdk/action/struct.Prove.html).

Core (Default)[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/proof-types#core-default)
------------------------------------------------------------------------------------------------

The default prover mode generates a list of STARK proofs that in aggregate have size proportional to the size of the execution. Use this in settings where you don't care about **verification cost / proof size**.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   let client = ProverClient::from_env();client.prove(&pk, &stdin).run().unwrap();   `

Compressed[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/proof-types#compressed)
------------------------------------------------------------------------------------------

The compressed prover mode generates STARK proofs that have constant size. Use this in settings where you care about **verification cost / proof size**, but not onchain verification. Compressed proofs are also useful because they can be cheaply recursively verified within SP1 itself (see the [proof aggregation](https://docs.succinct.xyz/docs/sp1/writing-programs/proof-aggregation) section).

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   let client = ProverClient::from_env();client.prove(&pk, &stdin).compressed().run().unwrap();   `

Groth16 (Recommended)[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/proof-types#groth16-recommended)
--------------------------------------------------------------------------------------------------------------

The Groth16 prover mode generates a SNARK proof that is ~260 bytes large and can be verified onchain for around ~270k gas.

The trusted setup for the Groth16 circuit keys uses the [Aztec Ignition ceremony](https://github.com/AztecProtocol/ignition-verification) + entropy contributions from members of the Succinct team. If you are uncomfortable with the security assumptions of the ceremony, you can use the PLONK proof type instead.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   let client = ProverClient::from_env();client.prove(&pk, &stdin).groth16().run().unwrap();   `

PLONK[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/proof-types#plonk)
--------------------------------------------------------------------------------

The PLONK prover mode generates a SNARK proof that is ~868 bytes large and can also be verified onchain for around ~300k gas. Plonk proofs take about ~1m30s longer to generate over a compressed proof.

PLONK does not require a trusted setup and reuses contributions from the Aztec Ignition ceremony.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   let client = ProverClient::from_env();client.prove(&pk, &stdin).plonk().run().unwrap();   `

Recommended Workflow

We recommend the following workflow for developing with SP1.

Step 1: Iterate on your program with execution only[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/recommended-workflow#step-1-iterate-on-your-program-with-execution-only)
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

While iterating on your SP1 program, you should **only execute** the program with the RISC-V runtime. This will allow you to verify the correctness of your program and test the SP1Stdin as well as the SP1PublicValues that are returned, without having to generate a proof (which can be slow and/or expensive). If the execution of your program succeeds, then proof generation should succeed as well!

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML``   use sp1_sdk::{include_elf, utils, ProverClient, SP1Stdin};/// The ELF we want to execute inside the zkVM.const ELF: &[u8] = include_elf!("fibonacci-program");fn main() {    // Setup logging.    utils::setup_logger();    // Create an input stream and write '500' to it.    let n = 500u32;    let mut stdin = SP1Stdin::new();    stdin.write(&n);    // Only execute the program and get a `SP1PublicValues` object.    let client = ProverClient::from_env();    let (mut public_values, execution_report) = client.execute(ELF, &stdin).run().unwrap();    // Print the total number of cycles executed and the full execution report with a breakdown of    // the RISC-V opcode and syscall counts.    println!(        "Executed program with {} cycles",        execution_report.total_instruction_count() + execution_report.total_syscall_count()    );    println!("Full execution report:\n{:?}", execution_report);    // Read and verify the output.    let _ = public_values.read::();    let a = public_values.read::();    let b = public_values.read::();    println!("a: {}", a);    println!("b: {}", b);}   ``

Note that printing out the total number of executed cycles and the full execution report provides helpful insight into proof generation latency and cost either for local proving or when using the prover network.

**Crate Setup:** We recommend that your program crate that defines the main function (around which you wrap the sp1\_zkvm::entrypoint! macro) should be kept minimal. Most of your business logic should be in a separate crate (in the same repo/workspace) that can be tested independently and that is not tied to the SP1 zkVM. This will allow you to unit test your program logic without having to worry about the zkvm compilation target. This will also allow you to efficient reuse types between your program crate and your crate that generates proofs.

**Note:** The ProverClient should be initialized once and reused for subsequent proving operations rather than creating new instances. This is because the initial initialization may be slow as it loads necessary proving parameters and sets up the environment. You can wrap the ProverClient in an Arc to share it across tasks.

Step 2: Generate proofs[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/recommended-workflow#step-2-generate-proofs)
----------------------------------------------------------------------------------------------------------------------------

After you have iterated on your program and finalized that it works correctly, you can generate proofs for your program for final end to end testing or production use.

### Generating proofs on the prover network (recommended)[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/recommended-workflow#generating-proofs-on-the-prover-network-recommended)

Using Succinct's prover prover network will generally be faster and cheaper than local proving, as it parallelizes proof generation amongst multiple machines and also uses SP1's GPU prover that is not yet available for local proving. Follow the [setup instructions](https://docs.succinct.xyz/docs/sp1/generating-proofs/prover-network) to get started with the prover network. Using the prover network only requires adding 1 environment variable from a regular SP1 proof generation script with the ProverClient.

There are a few things to keep in mind when using the prover network.

### Prover Network FAQ[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/recommended-workflow#prover-network-faq)

#### Benchmarking latency on the prover network[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/recommended-workflow#benchmarking-latency-on-the-prover-network)

The prover network currently parallelizes proof generation across multiple machines. This means the latency of proof generation does not scale linearly with the number of cycles of your program, but rather with the number of cycles of your program divided by the number of currently available machines on the prover network.

Our prover network currently has limited capacity because it is still in beta. If you have an extremely latency sensitive use-case and you want to figure out the **minimal latency possible** for your program, you should [reach out to us](https://partner.succinct.xyz/) and we can onboard you to our reserved capacity cluster that has a dedicated instances that can significantly reduce latency.

#### Costs on the prover network[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/recommended-workflow#costs-on-the-prover-network)

The cost of proof generation on the prover network scales approximately linearly with the number of cycles of your program (along with the number of syscalls that your program makes). For larger workloads with regular proof frequency (like rollups and light clients), we can offer discounted pricing. To figure out how much your program will cost to prove, you can get [in touch with us](https://partner.succinct.xyz/) to discuss pricing options.

Note that **latency is not the same as cost**, because we parallelize proof generation across multiple machines, so two proofs with the same latency can be using a different number of machines, impacting the cost.

#### Benchmarking on small vs. large programs[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/recommended-workflow#benchmarking-on-small-vs-large-programs)

In SP1, there is a fixed overhead for proving that is independent of your program's cycle count. This means that benchmarking on _small programs_ is not representative of the performance of larger programs. To get an idea of the scale of programs for real-world workloads, you can refer to our [benchmarking blog post](https://blog.succinct.xyz/sp1-production-benchmarks) and also some numbers below:

*   An average Ethereum block can be between 100-500M cycles (including merkle proof verification for storage and execution of transactions) with our keccak and secp256k1 precompiles.
    
*   For a Tendermint light client, the average cycle count can be between 10M and 50M cycles (including our ed25519 precompiles).
    
*   We consider programs with <2M cycles to be "small" and by default, the fixed overhead of proving will dominate the proof latency. If latency is incredibly important for your use-case, we can specialize the prover network for your program if you reach out to us.
    

Note that if you generate Groth16 or PLONK proofs on the prover network, you will encounter a fixed overhead for the STARK -> SNARK wrapping step. We're actively working on reducing this overhead in future releases.

#### On-Demand vs. Reserved Capacity[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/recommended-workflow#on-demand-vs-reserved-capacity)

The prover network is currently in beta and has limited capacity. For high volume use-cases, we can offer discounted pricing and a reserved capacity cluster that has a dedicated instances that can significantly reduce latency and have higher throughput and guaranteed SLAs.

### Generating proofs locally[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/recommended-workflow#generating-proofs-locally)

If you want to generate proofs locally, you can use the sp1\_sdk crate to generate proofs locally as outlined in the [Basics](https://docs.succinct.xyz/docs/sp1/generating-proofs/basics) section. By default, the ProverClient will generate proofs locally using your CPU. Check out the hardware requirements for locally proving [here](https://docs.succinct.xyz/docs/sp1/getting-started/hardware-requirements#local-proving).

AVX

SP1 supports both AVX256 and AVX512 acceleration on x86 CPUs due to support in [Plonky3](https://github.com/Plonky3/Plonky3). Whenever possible, we recommend using AVX512 acceleration as it provides better performance.

Checking for AVX[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/hardware-acceleration/avx#checking-for-avx)
--------------------------------------------------------------------------------------------------------------------

To check if your CPU supports AVX, you can run the following command:

grep avx /proc/cpuinfo

Look for the flags avx2 and avx512.

Enabling AVX256[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/hardware-acceleration/avx#enabling-avx256)
------------------------------------------------------------------------------------------------------------------

To enable AVX256 acceleration, you can set the RUSTFLAGS environment variable to include the following flags:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   RUSTFLAGS="-C target-cpu=native" cargo run --release   `

Enabling AVX512[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/hardware-acceleration/avx#enabling-avx512)
------------------------------------------------------------------------------------------------------------------

To enable AVX512 acceleration, you can set the RUSTFLAGS environment variable to include the following flags:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   RUSTFLAGS="-C target-cpu=native -C target-feature=+avx512f" cargo run --release   `

Note that the +avx512f flag is required to enable AVX512 acceleration.

CUDA

WARNING: CUDA proving is still an experimental feature and may be buggy.

SP1 supports CUDA acceleration, which can provide dramatically better latency and cost performance compared to using the CPU prover, even with AVX acceleration.

Software Requirements[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/hardware-acceleration/cuda#software-requirements)
-------------------------------------------------------------------------------------------------------------------------------

Please make sure you have the following installed before using the CUDA prover:

*   [CUDA 12](https://developer.nvidia.com/cuda-12-0-0-download-archive?target_os=Linux&target_arch=x86_64&Distribution=Ubuntu&target_version=22.04&target_type=deb_local)
    
*   [CUDA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html)
    

Hardware Requirements[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/hardware-acceleration/cuda#hardware-requirements)
-------------------------------------------------------------------------------------------------------------------------------

*   **CPU**: We recommend having at least 8 CPU cores with 32GB of RAM available to fully utilize the GPU.
    
*   **GPU**: 24GB or more for core/compressed proofs, 40GB or more for shrink/wrap proofs
    

Usage[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/hardware-acceleration/cuda#usage)
-----------------------------------------------------------------------------------------------

To use the CUDA prover, you have two options:

1.  Use ProverClient::from\_env to build the client and set SP1\_PROVER environment variable to cuda.
    
2.  Use ProverClient::builder().cuda().build() to build the client.
    

Then, use your standard methods on the ProverClient to generate proofs.

Prover Network: Key Setup

The prover network uses Secp256k1 keypairs for authentication, similar to Ethereum wallets. You may generate a new keypair explicitly for use with the prover network, or use an existing keypair.

> **You do not need to hold any funds in this account, it is used solely for access control.**

### Generate a Public Key[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/prover-network/key-setup#generate-a-public-key)

Prover network keypair credentials can be generated using the [cast](https://book.getfoundry.sh/cast/) CLI tool.

First install [Foundry](https://book.getfoundry.sh/getting-started/installation#using-foundryup):

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   curl -L https://foundry.paradigm.xyz | bash   `

Upon running this command, you will be prompted to source your shell profile and run foundryup. Afterwards you should have access to the cast command.

Use cast to generate a new keypair:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cast wallet new   `

which will give you an output similar to this:

The "Address" what you should submit in the [form](https://forms.gle/rTUvhstS8PFfv9B3A), in the example above this is 0x552f0FC6D736ed965CE07a3D71aA639De15B627b. The "Private key" should be kept safe and secure. When interacting with the network, you will set your NETWORK\_PRIVATE\_KEY environment variable to this value.

### Retrieve an Existing Key[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/prover-network/key-setup#retrieve-an-existing-key)

If you already have an existing key you would like to use, you can also use cast retrieve your address:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cast wallet address --private-key $PRIVATE_KEY   `

Prover Network: Usage

> **See** [**Supported Versions**](https://docs.succinct.xyz/docs/sp1/generating-proofs/prover-network/versions) **for the currently supported versions of SP1 on the Prover Network.**
> 
> **🚨 Please subscribe to our** [**email list**](https://stats.sender.net/forms/elYpO1/view) **for critical SP1 updates, prover network upgrades, and security disclosures.**

Sending a proof request[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/prover-network/usage#sending-a-proof-request)
-----------------------------------------------------------------------------------------------------------------------------

To use the prover network to generate a proof, you can run your script that uses sp1\_sdk::ProverClient as you would normally but with additional environment variables set:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   // Generate the proof for the given program.let client = ProverClient::from_env();let (pk, vk) = client.setup(ELF);let mut proof = client.prove(&pk, &stdin).run().unwrap();   `

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   SP1_PROVER=network NETWORK_PRIVATE_KEY=... RUST_LOG=info cargo run --release   `

*   SP1\_PROVER should be set to network rather than the default cpu when using the prover network. This variable allows you to switch between the CPU and network provers.
    
*   NETWORK\_PRIVATE\_KEY should be set to your [private key](https://docs.succinct.xyz/docs/sp1/generating-proofs/prover-network/key-setup). You will need to be using a [whitelisted](https://docs.succinct.xyz/docs/sp1/generating-proofs/prover-network) key to use the network.
    

When you call any of the prove functions in ProverClient now, it will first simulate your program, then wait for it to be proven through the network and finally return the proof.

View the status of your proof[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/prover-network/usage#view-the-status-of-your-proof)
-----------------------------------------------------------------------------------------------------------------------------------------

You can view your proof and other running proofs on the [explorer](https://testnet.succinct.xyz/). The page for your proof will show details such as the stage of your proof and the cycles used. It also shows the vk hash of the program.

Supported Versions

The prover network currently only supports specific versions of SP1:

VersionDescriptionv4.X.XV4 Release. Latest performant & production ready version.v3.X.XV3 Release. Previous circuit version deprecated in January 2025.

X denotes that any minor and patch version is supported (e.g. v2.1.0, v2.1.1).

If you submit a proof request to the prover network and you are not using a supported version, you will receive an error message.

Changing versions[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/prover-network/versions#changing-versions)
--------------------------------------------------------------------------------------------------------------------

You must switch to a supported version before submitting a proof. To do so, replace the sp1-zkvm version in your program's Cargo.toml:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   [dependencies]sp1-zkvm = "4.0.0"   `

replace the sp1-sdk version in your script's Cargo.toml:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   [dependencies]sp1-sdk = "4.0.0"   `

Re-build your program and script, and then try again.

Advanced

Execution Only[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/advanced#execution-only)
-----------------------------------------------------------------------------------------------

We recommend that during the development of large programs (> 1 million cycles) you do not generate proofs each time. Instead, you should have your script only execute the program with the RISC-V runtime and read public\_values. Here is an example:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML``   use sp1_sdk::{include_elf, utils, ProverClient, SP1Stdin};/// The ELF we want to execute inside the zkVM.const ELF: &[u8] = include_elf!("fibonacci-program");fn main() {    // Setup logging.    utils::setup_logger();    // Create an input stream and write '500' to it.    let n = 500u32;    let mut stdin = SP1Stdin::new();    stdin.write(&n);    // Only execute the program and get a `SP1PublicValues` object.    let client = ProverClient::from_env();    let (mut public_values, execution_report) = client.execute(ELF, &stdin).run().unwrap();    // Print the total number of cycles executed and the full execution report with a breakdown of    // the RISC-V opcode and syscall counts.    println!(        "Executed program with {} cycles",        execution_report.total_instruction_count() + execution_report.total_syscall_count()    );    println!("Full execution report:\n{:?}", execution_report);    // Read and verify the output.    let _ = public_values.read::();    let a = public_values.read::();    let b = public_values.read::();    println!("a: {}", a);    println!("b: {}", b);}   ``

If the execution of your program succeeds, then proof generation should succeed as well! (Unless there is a bug in our zkVM implementation.)

Logging and Tracing Information[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/advanced#logging-and-tracing-information)
---------------------------------------------------------------------------------------------------------------------------------

You can use utils::setup\_logger() to enable logging information respectively. You should only use one or the other of these functions.

**Logging:**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   utils::setup_logger();   `

You must run your command with:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   RUST_LOG=info cargo run --release   `

CPU Acceleration[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/advanced#cpu-acceleration)
---------------------------------------------------------------------------------------------------

To enable CPU acceleration, you can use the RUSTFLAGS environment variable to enable the target-cpu=native flag when running your script. This will enable the compiler to generate code that is optimized for your CPU.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   RUSTFLAGS='-C target-cpu=native' cargo run --release   `

Currently there is support for AVX512 and NEON SIMD instructions. For NEON, you must also enable the sp1-sdk feature neon in your script crate's Cargo.toml file.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   sp1-sdk = { version = "...", features = ["neon"] }   `

Performance[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/advanced#performance)
-----------------------------------------------------------------------------------------

For maximal performance, you should run proof generation with the following command and vary your shard\_size depending on your program's number of cycles.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   SHARD_SIZE=4194304 RUST_LOG=info RUSTFLAGS='-C target-cpu=native' cargo run --release   `

Memory Usage[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/advanced#memory-usage)
-------------------------------------------------------------------------------------------

To reduce memory usage, set the SHARD\_BATCH\_SIZE environment variable depending on how much RAM your machine has. A higher number will use more memory, but will be faster.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   SHARD_BATCH_SIZE=1 SHARD_SIZE=2097152 RUST_LOG=info RUSTFLAGS='-C target-cpu=native' cargo run --release   `

Advanced Allocator[​](https://docs.succinct.xyz/docs/sp1/generating-proofs/advanced#advanced-allocator)
-------------------------------------------------------------------------------------------------------

SP1 programs use a simple bump allocator by default, which just increments a pointer to allocate memory. Although this works for many cases, some programs can still run out of memory in the SP1 zkVM. To address this, you can enable the embedded allocator feature on the SP1 zkVM.

The embedded allocator uses the [embedded-alloc crate](https://crates.io/crates/embedded-alloc) and offers more flexible memory management, albeit with extra cycle overhead.

To enable it, add the following to your sp1-zkvm dependency in Cargo.toml:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   sp1-zkvm = { version = "...", features = ["embedded"] }   `

Once enabled, the embedded allocator replaces the default bump allocator.

Offchain Verification

Rust no\_std Verification[​](https://docs.succinct.xyz/docs/sp1/verification/off-chain-verification#rust-no_std-verification)
-----------------------------------------------------------------------------------------------------------------------------

You can verify SP1 Groth16 and Plonk proofs in no\_std environments with [sp1-verifier](https://docs.rs/sp1-verifier/latest/sp1_verifier/).

sp1-verifier is also patched to verify Groth16 and Plonk proofs within the SP1 zkVM, using [bn254](https://blog.succinct.xyz/succinctshipsprecompiles/) precompiles. For an example of this, see the [Groth16 Example](https://github.com/succinctlabs/sp1/tree/main/examples/groth16/).

### Installation[​](https://docs.succinct.xyz/docs/sp1/verification/off-chain-verification#installation)

Import the following dependency in your Cargo.toml:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   sp1-verifier = {version = "4.0.0", default-features = false}   `

### Usage[​](https://docs.succinct.xyz/docs/sp1/verification/off-chain-verification#usage)

sp1-verifier's interface is very similar to the solidity verifier's. It exposes two public functions: [Groth16Verifier::verify\_proof](https://docs.rs/sp1-verifier/latest/src/sp1_verifier/groth16.rs.html) and [PlonkVerifier::verify\_proof](https://docs.rs/sp1-verifier/latest/src/sp1_verifier/plonk.rs.html).

sp1-verifier also exposes the Groth16 and Plonk verifying keys as constants, GROTH16\_VK\_BYTES and PLONK\_VK\_BYTES. These keys correspond to the current SP1 version's official Groth16 and Plonk verifying keys, which are used for verifying proofs generated using docker or the prover network.

First, generate your groth16/plonk proof with the SP1 SDK. See [here](https://docs.succinct.xyz/docs/sp1/verification/onchain/getting-started#generating-sp1-proofs-for-onchain-verification) for more information -- sp1-verifier and the solidity verifier expect inputs in the same format.

Next, verify the proof with sp1-verifier. The following snippet is from the [Groth16 example program](https://github.com/succinctlabs/sp1/tree/dev/examples/groth16/), which verifies a Groth16 proof within SP1 using sp1-verifier.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   //! A program that verifies a Groth16 proof in SP1.#![no_main]sp1_zkvm::entrypoint!(main);use sp1_verifier::Groth16Verifier;pub fn main() {    // Read the proof, public values, and vkey hash from the input stream.    let proof = sp1_zkvm::io::read_vec();    let sp1_public_values = sp1_zkvm::io::read_vec();    let sp1_vkey_hash: String = sp1_zkvm::io::read();    // Verify the groth16 proof.    let groth16_vk = *sp1_verifier::GROTH16_VK_BYTES;    println!("cycle-tracker-start: verify");    let result = Groth16Verifier::verify(&proof, &sp1_public_values, &sp1_vkey_hash, groth16_vk);    println!("cycle-tracker-end: verify");    match result {        Ok(()) => {            println!("Proof is valid");        }        Err(e) => {            println!("Error verifying proof: {:?}", e);        }    }}   `

Here, the proof, public inputs, and vkey hash are read from stdin. See the following snippet to see how these values are generated.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML``   //! A script that generates a Groth16 proof for the Fibonacci program, and verifies the//! Groth16 proof in SP1.use sp1_sdk::{include_elf, utils, HashableKey, ProverClient, SP1Stdin};/// The ELF for the Groth16 verifier program.const GROTH16_ELF: &[u8] = include_elf!("groth16-verifier-program");/// The ELF for the Fibonacci program.const FIBONACCI_ELF: &[u8] = include_elf!("fibonacci-program");/// Generates the proof, public values, and vkey hash for the Fibonacci program in a format that/// can be read by `sp1-verifier`.////// Returns the proof bytes, public values, and vkey hash.fn generate_fibonacci_proof() -> (Vec, Vec, String) {    // Create an input stream and write '20' to it.    let n = 20u32;    // The input stream that the program will read from using `sp1_zkvm::io::read`. Note that the    // types of the elements in the input stream must match the types being read in the program.    let mut stdin = SP1Stdin::new();    stdin.write(&n);    // Create a `ProverClient`.    let client = ProverClient::from_env();    // Generate the groth16 proof for the Fibonacci program.    let (pk, vk) = client.setup(FIBONACCI_ELF);    println!("vk: {:?}", vk.bytes32());    let proof = client.prove(&pk, &stdin).groth16().run().unwrap();    (proof.bytes(), proof.public_values.to_vec(), vk.bytes32())}fn main() {    // Setup logging.    utils::setup_logger();    // Generate the Fibonacci proof, public values, and vkey hash.    let (fibonacci_proof, fibonacci_public_values, vk) = generate_fibonacci_proof();    // Write the proof, public values, and vkey hash to the input stream.    let mut stdin = SP1Stdin::new();    stdin.write_vec(fibonacci_proof);    stdin.write_vec(fibonacci_public_values);    stdin.write(&vk);    // Create a `ProverClient`.    let client = ProverClient::from_env();    // Execute the program using the `ProverClient.execute` method, without generating a proof.    let (_, report) = client.execute(GROTH16_ELF, &stdin).run().unwrap();    println!("executed groth16 program with {} cycles", report.total_instruction_count());    println!("{}", report);}   ``

> Note that the SP1 SDK itself is _not_ no\_std compatible.

Wasm Verification[​](https://docs.succinct.xyz/docs/sp1/verification/off-chain-verification#wasm-verification)
--------------------------------------------------------------------------------------------------------------

The [example-sp1-wasm-verifier](https://github.com/succinctlabs/example-sp1-wasm-verifier) demonstrates how to verify SP1 proofs in wasm. For a more detailed explanation of the process, please see the [README](https://github.com/succinctlabs/example-sp1-wasm-verifier/blob/main/README.md).

Onchain Verification: Setup

The best way to get started with verifying SP1 proofs on-chain is to refer to the [SP1 Project Template](https://github.com/succinctlabs/sp1-project-template/tree/main).

*   The template [program](https://github.com/succinctlabs/sp1-project-template/blob/main/program/src/main.rs) shows how to write outputs that can be decoded in Solidity.
    
*   The template [script](https://github.com/succinctlabs/sp1-project-template/blob/main/script/src/bin/prove.rs) shows how to generate the proof using the SDK and save it to a file.
    
*   The template [contract](https://github.com/succinctlabs/sp1-project-template/blob/main/contracts/src/Fibonacci.sol) shows how to verify the proof onchain using Solidity.
    

Refer to the section on [Contract Addresses](https://docs.succinct.xyz/docs/sp1/verification/onchain/contract-addresses) for the addresses of the deployed verifiers.

Generating SP1 Proofs for Onchain Verification[​](https://docs.succinct.xyz/docs/sp1/verification/onchain/getting-started#generating-sp1-proofs-for-onchain-verification)
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

By default, the proofs generated by SP1 are not verifiable onchain, as they are non-constant size and STARK verification on Ethereum is very expensive. To generate a proof that can be verified onchain, we use performant STARK recursion to combine SP1 shard proofs into a single STARK proof and then wrap that in a SNARK proof. Our ProverClient has a prover option for this called plonk. Behind the scenes, this function will first generate a normal SP1 proof, then recursively combine all of them into a single proof using the STARK recursion protocol. Finally, the proof is wrapped in a SNARK proof using PLONK.

> WARNING: The Groth16 and PLONK provers are only guaranteed to work on official releases of SP1. To use Groth16 or PLONK proving & verification locally, ensure that you have Docker installed and have at least 32GB of RAM. Note that you might need to increase the memory limit for [docker desktop](https://docs.docker.com/desktop/settings-and-maintenance/settings/#resources) if you're running on Mac.

### Example[​](https://docs.succinct.xyz/docs/sp1/verification/onchain/getting-started#example)

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   use sp1_sdk::{include_elf, utils, HashableKey, ProverClient, SP1Stdin};/// The ELF we want to execute inside the zkVM.const ELF: &[u8] = include_elf!("fibonacci-program");fn main() {    // Setup logging.    utils::setup_logger();    // Create an input stream and write '500' to it.    let n = 500u32;    let mut stdin = SP1Stdin::new();    stdin.write(&n);    // Set up the pk and vk.    let client = ProverClient::from_env();    let (pk, vk) = client.setup(ELF);    println!("vk: {:?}", vk.bytes32());    // Generate the Groth16 proof.    let proof = client.prove(&pk, &stdin).groth16().run().unwrap();    println!("generated proof");    // Get the public values as bytes.    let public_values = proof.public_values.as_slice();    println!("public values: 0x{}", hex::encode(public_values));    // Get the proof as bytes.    let solidity_proof = proof.bytes();    println!("proof: 0x{}", hex::encode(solidity_proof));    // Verify proof and public values    client.verify(&proof, &vk).expect("verification failed");    // Save the proof.    proof.save("fibonacci-groth16.bin").expect("saving proof failed");    println!("successfully generated and verified proof for the program!")}   `

You can run the above script with RUST\_LOG=info cargo run --bin groth16\_bn254 --release in examples/fibonacci/script.

Contract Addresses
==================

> The current officially supported version of SP1 is **V4.0.0**.
> 
> All previous versions are deprecated and may not work as expected on the gateways.

To verify SP1 proofs on-chain, we recommend using our deployed canonical verifier gateways. The [SP1VerifierGateway](https://github.com/succinctlabs/sp1-contracts/blob/main/contracts/src/ISP1VerifierGateway.sol) will automatically route your SP1 proof to the correct verifier based on the SP1 version used.

Canonical Verifier Gateways[​](https://docs.succinct.xyz/docs/sp1/verification/onchain/contract-addresses#canonical-verifier-gateways)
--------------------------------------------------------------------------------------------------------------------------------------

There are different verifier gateway for each proof system: Groth16 and PLONK. This means that you must use the correct verifier gateway depending on if you are verifying a Groth16 or PLONK proof.

### Groth16[​](https://docs.succinct.xyz/docs/sp1/verification/onchain/contract-addresses#groth16)

Chain IDChainGateway1Mainnet[0x397A5f7f3dBd538f23DE225B51f532c34448dA9B](https://etherscan.io/address/0x397A5f7f3dBd538f23DE225B51f532c34448dA9B)11155111Sepolia[0x397A5f7f3dBd538f23DE225B51f532c34448dA9B](https://sepolia.etherscan.io/address/0x397A5f7f3dBd538f23DE225B51f532c34448dA9B)17000Holesky[0x397A5f7f3dBd538f23DE225B51f532c34448dA9B](https://holesky.etherscan.io/address/0x397A5f7f3dBd538f23DE225B51f532c34448dA9B)42161Arbitrum One[0x397A5f7f3dBd538f23DE225B51f532c34448dA9B](https://arbiscan.io/address/0x397A5f7f3dBd538f23DE225B51f532c34448dA9B)421614Arbitrum Sepolia[0x397A5f7f3dBd538f23DE225B51f532c34448dA9B](https://sepolia.arbiscan.io/address/0x397A5f7f3dBd538f23DE225B51f532c34448dA9B)8453Base[0x397A5f7f3dBd538f23DE225B51f532c34448dA9B](https://basescan.org/address/0x397A5f7f3dBd538f23DE225B51f532c34448dA9B)84532Base Sepolia[0x397A5f7f3dBd538f23DE225B51f532c34448dA9B](https://sepolia.basescan.org/address/0x397A5f7f3dBd538f23DE225B51f532c34448dA9B)10Optimism[0x397A5f7f3dBd538f23DE225B51f532c34448dA9B](https://optimistic.etherscan.io/address/0x397A5f7f3dBd538f23DE225B51f532c34448dA9B)11155420Optimism Sepolia[0x397A5f7f3dBd538f23DE225B51f532c34448dA9B](https://sepolia-optimism.etherscan.io/address/0x397A5f7f3dBd538f23DE225B51f532c34448dA9B)534351Scroll Sepolia[0x397A5f7f3dBd538f23DE225B51f532c34448dA9B](https://sepolia.scrollscan.com/address/0x397A5f7f3dBd538f23DE225B51f532c34448dA9B)534352Scroll[0x397A5f7f3dBd538f23DE225B51f532c34448dA9B](https://scrollscan.com/address/0x397A5f7f3dBd538f23DE225B51f532c34448dA9B)

### PLONK[​](https://docs.succinct.xyz/docs/sp1/verification/onchain/contract-addresses#plonk)

Chain ID Chain Gateway1 Mainnet [0x3B6041173B80E77f038f3F2C0f9744f04837185e](https://etherscan.io/address/0x3B6041173B80E77f038f3F2C0f9744f04837185e)11155111Sepolia[0x3B6041173B80E77f038f3F2C0f9744f04837185e](https://sepolia.etherscan.io/address/0x3B6041173B80E77f038f3F2C0f9744f04837185e)17000Holesky[0x3B6041173B80E77f038f3F2C0f9744f04837185e](https://holesky.etherscan.io/address/0x3B6041173B80E77f038f3F2C0f9744f04837185e)42161Arbitrum One[0x3B6041173B80E77f038f3F2C0f9744f04837185e](https://arbiscan.io/address/0x3B6041173B80E77f038f3F2C0f9744f04837185e)421614Arbitrum Sepolia[0x3B6041173B80E77f038f3F2C0f9744f04837185e](https://sepolia.arbiscan.io/address/0x3B6041173B80E77f038f3F2C0f9744f04837185e)8453Base[0x3B6041173B80E77f038f3F2C0f9744f04837185e](https://basescan.org/address/0x3B6041173B80E77f038f3F2C0f9744f04837185e)84532Base Sepolia[0x3B6041173B80E77f038f3F2C0f9744f04837185e](https://sepolia.basescan.org/address/0x3B6041173B80E77f038f3F2C0f9744f04837185e)10Optimism[0x3B6041173B80E77f038f3F2C0f9744f04837185e](https://optimistic.etherscan.io/address/0x3b6041173b80e77f038f3f2c0f9744f04837185e)11155420Optimism Sepolia[0x3B6041173B80E77f038f3F2C0f9744f04837185e](https://sepolia-optimism.etherscan.io/address/0x3B6041173B80E77f038f3F2C0f9744f04837185e)534351Scroll Sepolia[0x3B6041173B80E77f038f3F2C0f9744f04837185e](https://sepolia.scrollscan.com/address/0x3B6041173B80E77f038f3F2C0f9744f04837185e)534352Scroll[0x3B6041173B80E77f038f3F2C0f9744f04837185e](https://scrollscan.com/address/0x3B6041173B80E77f038f3F2C0f9744f04837185e)

The most up-to-date reference on each chain can be found in the [deployments](https://github.com/succinctlabs/sp1-contracts/blob/main/contracts/deployments) directory in the SP1 contracts repository, where each chain has a dedicated JSON file with each verifier's address.

Versioning Policy[​](https://docs.succinct.xyz/docs/sp1/verification/onchain/contract-addresses#versioning-policy)
------------------------------------------------------------------------------------------------------------------

Whenever a verifier for a new SP1 version is deployed, the gateway contract will be updated to support it with [addRoute()](https://github.com/succinctlabs/sp1-contracts/blob/main/contracts/src/ISP1VerifierGateway.sol#L65). If a verifier for an SP1 version has an issue, the route will be frozen with [freezeRoute()](https://github.com/succinctlabs/sp1-contracts/blob/main/contracts/src/ISP1VerifierGateway.sol#L71).

On mainnets, only official versioned releases are deployed and added to the gateway. Testnets have rc versions of the verifier deployed supported in addition to the official versions.

Deploying to other Chains[​](https://docs.succinct.xyz/docs/sp1/verification/onchain/contract-addresses#deploying-to-other-chains)
----------------------------------------------------------------------------------------------------------------------------------

In the case that you need to use a chain that is not listed above, you can deploy your own verifier contract by following the instructions in the [SP1 Contracts Repo](https://github.com/succinctlabs/sp1-contracts/blob/main/README.md#deployments).

Since both the SP1VerifierGateway and each SP1Verifier implement the [ISP1Verifier interface](https://github.com/succinctlabs/sp1-contracts/blob/main/contracts/src/ISP1Verifier.sol), you can choose to either:

*   Deploy the SP1VerifierGateway and add SP1Verifier contracts to it. Then point to the SP1VerifierGateway address in your contracts.
    
*   Deploy just the SP1Verifier contract that you want to use. Then point to the SP1Verifier address in your contracts.
    

If you want support for a canonical verifier on your chain, contact us [here](https://t.me/+AzG4ws-kD24yMGYx). We often deploy canonical verifiers on new chains if there's enough demand.

ISP1Verifier Interface[​](https://docs.succinct.xyz/docs/sp1/verification/onchain/contract-addresses#isp1verifier-interface)
----------------------------------------------------------------------------------------------------------------------------

All verifiers implement the [ISP1Verifier](https://github.com/succinctlabs/sp1-contracts/blob/main/contracts/src/ISP1Verifier.sol) interface.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   // SPDX-License-Identifier: MITpragma solidity ^0.8.20;/// @title SP1 Verifier Interface/// @author Succinct Labs/// @notice This contract is the interface for the SP1 Verifier.interface ISP1Verifier {    /// @notice Verifies a proof with given public values and vkey.    /// @dev It is expected that the first 4 bytes of proofBytes must match the first 4 bytes of    /// target verifier's VERIFIER_HASH.    /// @param programVKey The verification key for the RISC-V program.    /// @param publicValues The public values encoded as bytes.    /// @param proofBytes The proof of the program execution the SP1 zkVM encoded as bytes.    function verifyProof(        bytes32 programVKey,        bytes calldata publicValues,        bytes calldata proofBytes    ) external view;}   `

Solidity Verifier

We maintain a suite of [contracts](https://github.com/succinctlabs/sp1-contracts/tree/main) used for verifying SP1 proofs onchain. We highly recommend using [Foundry](https://book.getfoundry.sh/).

Installation[​](https://docs.succinct.xyz/docs/sp1/verification/onchain/solidity-sdk#installation)
--------------------------------------------------------------------------------------------------

To install the latest release version:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   forge install succinctlabs/sp1-contracts   `

To install a specific version:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   forge install succinctlabs/sp1-contracts@   `

Finally, add @sp1-contracts/=lib/sp1-contracts/contracts/src/ in remappings.txt.

### Usage[​](https://docs.succinct.xyz/docs/sp1/verification/onchain/solidity-sdk#usage)

Once installed, you can use the contracts in the library by importing them:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   // SPDX-License-Identifier: MITpragma solidity ^0.8.20;import {ISP1Verifier} from "@sp1-contracts/ISP1Verifier.sol";/// @title Fibonacci./// @author Succinct Labs/// @notice This contract implements a simple example of verifying the proof of a computing a///         fibonacci number.contract Fibonacci {    /// @notice The address of the SP1 verifier contract.    /// @dev This can either be a specific SP1Verifier for a specific version, or the    ///      SP1VerifierGateway which can be used to verify proofs for any version of SP1.    ///      For the list of supported verifiers on each chain, see:    ///      https://docs.succinct.xyz/onchain-verification/contract-addresses    address public verifier;    /// @notice The verification key for the fibonacci program.    bytes32 public fibonacciProgramVKey;    constructor(address _verifier, bytes32 _fibonacciProgramVKey) {        verifier = _verifier;        fibonacciProgramVKey = _fibonacciProgramVKey;    }    /// @notice The entrypoint for verifying the proof of a fibonacci number.    /// @param _proofBytes The encoded proof.    /// @param _publicValues The encoded public values.    function verifyFibonacciProof(bytes calldata _publicValues, bytes calldata _proofBytes)        public        view        returns (uint32, uint32, uint32)    {        ISP1Verifier(verifier).verifyProof(fibonacciProgramVKey, _publicValues, _proofBytes);        (uint32 n, uint32 a, uint32 b) = abi.decode(_publicValues, (uint32, uint32, uint32));        return (n, a, b);    }}   `

### Finding your program vkey[​](https://docs.succinct.xyz/docs/sp1/verification/onchain/solidity-sdk#finding-your-program-vkey)

The program vkey (fibonacciProgramVKey in the example above) is passed into the ISP1Verifier along with the public values and proof bytes. You can find your program vkey by going through the following steps:

1.  Find what version of SP1 crates you are using.
    
2.  Use the version from step to run this command: sp1up --version
    
3.  Use the vkey command to get the program vkey: cargo prove vkey -elf
    

Alternatively, you can set up a simple script to do this using the sp1-sdk crate:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   fn main() {    // Setup the logger.    sp1_sdk::utils::setup_logger();    // Setup the prover client.    let client = ProverClient::from_env();    // Setup the program.    let (_, vk) = client.setup(FIBONACCI_ELF);    // Print the verification key.    println!("Program Verification Key: {}", vk.bytes32());}   `

### Testing[​](https://docs.succinct.xyz/docs/sp1/verification/onchain/solidity-sdk#testing)

To test the contract, we recommend setting up [Foundry Tests](https://book.getfoundry.sh/forge/tests). We have an example of such a test in the [SP1 Project Template](https://github.com/succinctlabs/sp1-project-template/blob/dev/contracts/test/Fibonacci.t.sol).

### Solidity Versions[​](https://docs.succinct.xyz/docs/sp1/verification/onchain/solidity-sdk#solidity-versions)

The officially deployed contracts are built using Solidity 0.8.20 and exist on the [sp1-contracts main](https://github.com/succinctlabs/sp1-contracts/tree/main) branch.

If you need to use different versions that are compatible with your contracts, there are also other branches you can install that contain different versions. For example for branch [main-0.8.15](https://github.com/succinctlabs/sp1-contracts/tree/main-0.8.15) contains the contracts with:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   pragma solidity ^0.8.15;   `

and you can install it with:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   forge install succinctlabs/sp1-contracts@main-0.8.15   `

If there is different versions that you need but there aren't branches for them yet, please ask in the [SP1 Telegram](https://t.me/+AzG4ws-kD24yMGYx).

Common Issues

Rust Version Errors[​](https://docs.succinct.xyz/docs/sp1/developers/common-issues#rust-version-errors)
-------------------------------------------------------------------------------------------------------

If you are using a library that has an MSRV specified, you may encounter an error like this when building your program.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML``   package `alloy cannot be built because it requires rustc 1.83 or newer, while the currently active rustc version is 1.82.0`   ``

This is due to the fact that your current Succinct Rust toolchain has been built with a lower version than the MSRV of the crates you are using.

You can check the version of your local Succinct Rust toolchain by running cargo +succinct --version. The latest release of the Succinct Rust toolchain is **1.82**. You can update to the latest version by running [sp1up](https://docs.succinct.xyz/docs/sp1/getting-started/install).

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   % sp1up% cargo +succinct --versioncargo 1.82.0-dev (8f40fc59f 2024-08-21)   `

A Succinct Rust toolchain with version **1.82** should work for all crates that have an MSRV of **1.82** or lower.

If the MSRV of your crate is higher than **1.82**, try the following:

*   cargo prove build --ignore-rust-version
    
*   let args = BuildArgs { ignore\_rust\_version: true, ..Default::default()};build\_program\_with\_args("path/to/program", args);
    

alloy\_sol\_types Errors[​](https://docs.succinct.xyz/docs/sp1/developers/common-issues#alloy_sol_types-errors)
---------------------------------------------------------------------------------------------------------------

If you are using a library that depends on alloy\_sol\_types, and encounter an error like this:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML``   perhaps two different versions of crate `alloy_sol_types` are being used?   ``

This is likely due to two different versions of alloy\_sol\_types being used. To fix this, you can set default-features to false for the sp1-sdk dependency in your Cargo.toml.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   [dependencies]sp1-sdk = { version = "4.0.0", default-features = false }   `

This will configure out the network feature which will remove the dependency on alloy\_sol\_types and configure out the NetworkProver.

Stack Overflow Errors + Bus Errors[​](https://docs.succinct.xyz/docs/sp1/developers/common-issues#stack-overflow-errors--bus-errors)
------------------------------------------------------------------------------------------------------------------------------------

If you encounter any of the following errors in a script using sp1-sdk:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   # Stack Overflow Errorthread 'main' has overflowed its stackfatal runtime error: stack overflow# Bus Errorzsh: bus error# Segmentation FaultSegmentation fault (core dumped)   `

Run your script with the --release flag. SP1 currently only supports release builds. This is because the sp1-core library and sp1-recursion require being compiled with the release profile.

C Binding Errors[​](https://docs.succinct.xyz/docs/sp1/developers/common-issues#c-binding-errors)
-------------------------------------------------------------------------------------------------

If you are building a program that uses C bindings or has dependencies that use C bindings, you may encounter the following errors:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cc did not execute successfully   `

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML``   Failed to find tool. Is `riscv32-unknown-elf-gcc` installed?   ``

To resolve this, re-install sp1 with the --c-toolchain flag:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   sp1up --c-toolchain   `

This will install the C++ toolchain for RISC-V and set the CC\_riscv32im\_succinct\_zkvm\_elf environment variable to the path of the installed riscv32-unknown-elf-gcc binary. You can also use your own C++ toolchain be setting this variable manually:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   export CC_riscv32im_succinct_zkvm_elf=/path/to/toolchain   `

Compilation Errors with [sp1-lib::syscall\_verify\_sp1\_proof](https://docs.rs/sp1-lib/latest/sp1_lib/fn.syscall_verify_sp1_proof.html)[​](https://docs.succinct.xyz/docs/sp1/developers/common-issues#compilation-errors-with-sp1-libsyscall_verify_sp1_proof)
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

If you are using the [sp1-lib::syscall\_verify\_sp1\_proof](https://docs.rs/sp1-lib/latest/sp1_lib/fn.syscall_verify_sp1_proof.html) function, you may encounter compilation errors when building your program.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML  ``[sp1]    = note: rust-lld: error: undefined symbol: syscall_verify_sp1_proof  [sp1]            >>> referenced by sp1_lib.b593533d149f0f6e-cgu.0  [sp1]            >>>               sp1_lib-8f5deb4c47d01871.sp1_lib.b593533d149f0f6e-cgu.0.rcgu.o:(sp1_lib::verify::verify_sp1_proof::h5c1bb38f11b3fe71) in ...  [sp1]  [sp1]  [sp1]  error: could not compile `package-name` (bin "package-name") due to 1 previous error``

To resolve this, ensure that you're importing both sp1-lib and sp1-zkvm with the verify feature enabled.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   [dependencies]sp1-lib = { version = "", features = ["verify"] }sp1-zkvm = { version = "", features = ["verify"] }   `

Failed to run LLVM passes: unknown pass name 'loweratomic'[​](https://docs.succinct.xyz/docs/sp1/developers/common-issues#failed-to-run-llvm-passes-unknown-pass-name-loweratomic)
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

The Rust compiler had breaking changes to its names of available options between 1.81 and 1.82.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML  `[sp1]     Compiling proc-macro2 v1.0.93  [sp1]     Compiling unicode-ident v1.0.14  [sp1]     Compiling quote v1.0.38  [sp1]     Compiling syn v2.0.96  [sp1]     Compiling serde_derive v1.0.217  [sp1]     Compiling serde v1.0.217  [sp1]  error: failed to run LLVM passes: unknown pass name 'loweratomic'`

This message indicates that you're trying to use sp1-build < 4.0.0 with the 1.82 toolchain, sp1-build versions >= 4.0.0 have support for the 1.82 and 1.81 toolchains.

Slow ProverClient Initialization[​](https://docs.succinct.xyz/docs/sp1/developers/common-issues#slow-proverclient-initialization)
---------------------------------------------------------------------------------------------------------------------------------

You may encounter slow ProverClient initialization times as it loads necessary proving parameters and sets up the environment. It is recommended to initialize the ProverClient once and reuse it for subsequent proving operations. You can wrap the ProverClient in an Arc to share it across tasks.

Usage in CI

Getting started[​](https://docs.succinct.xyz/docs/sp1/developers/usage-in-ci#getting-started)
---------------------------------------------------------------------------------------------

You may want to use SP1 in your [Github Actions](https://docs.github.com/en/actions) CI workflow.

You first need to have Rust installed, and you can use [actions-rs/toolchain](https://github.com/actions-rs/toolchain) for this:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   - name: Install Rust Toolchain  uses: actions-rs/toolchain@v1  with:    toolchain: 1.81.0    profile: default    override: true    default: true    components: llvm-tools, rustc-dev   `

And then you can install the SP1 toolchain:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   - name: Install SP1 toolchain  run: |    curl -L https://sp1up.succinct.xyz | bash    ~/.sp1/bin/sp1up     ~/.sp1/bin/cargo-prove prove --version   `

You might experience rate limiting from sp1up. Using a Github [Personal Access Token (PAT)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) will help.

Try setting a github actions secret to your PAT, and then passing it into the sp1up command:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   - name: Install SP1 toolchain  run: |    curl -L https://sp1up.succinct.xyz | bash    ~/.sp1/bin/sp1up --token "${{ secrets.GH_PAT }}"    ~/.sp1/bin/cargo-prove prove --version   `

Note: Installing via sp1up always installs the latest version, its recommended to [use a release commit](https://github.com/succinctlabs/sp1/releases) via sp1up -C .

Speeding up your CI workflow[​](https://docs.succinct.xyz/docs/sp1/developers/usage-in-ci#speeding-up-your-ci-workflow)
-----------------------------------------------------------------------------------------------------------------------

### Caching[​](https://docs.succinct.xyz/docs/sp1/developers/usage-in-ci#caching)

To speed up your CI workflow, you can cache the Rust toolchain and Succinct toolchain. See this example from SP1's CI workflow, which caches the ~/.cargo and parts of the ~/.sp1 directories.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   - name: rust-cache  uses: actions/cache@v3  with:    path: |      ~/.cargo/bin/      ~/.cargo/registry/index/      ~/.cargo/registry/cache/      ~/.cargo/git/db/      target/      ~/.rustup/      ~/.sp1/circuits/plonk/ # Cache these if you're generating plonk proofs with docker in CI.      ~/.sp1/circuits/groth16/ # Cache these if you're generating groth16 proofs with docker in CI.    key: rust-1.81.0-${{ hashFiles('**/Cargo.toml') }}        restore-keys: rust-1.81.0-   `

### runs-on for bigger instances[​](https://docs.succinct.xyz/docs/sp1/developers/usage-in-ci#runs-on-for-bigger-instances)

Since SP1 is a fairly large repository, it might be useful to use [runs-on](https://github.com/runs-on/runs-on) to specify a larger instance type.

[Edit this page](https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/sp1/developers/usage-in-ci.md)Security Model

The goal of SP1 zkVM is to transform an arbitrary program written in an LLVM-compiled language into a sound zero-knowledge proof, proving the program's correct execution. SP1's security model outlines the necessary cryptographic assumptions and program safety requirements to ensure secure proof generation and verification. It also addresses our trusted setup process and additional practical measures to enhance the security of using SP1.

Cryptographic Security Model[​](https://docs.succinct.xyz/docs/sp1/security/security-model#cryptographic-security-model)
------------------------------------------------------------------------------------------------------------------------

### Hash Functions and the Random Oracle Model[​](https://docs.succinct.xyz/docs/sp1/security/security-model#hash-functions-and-the-random-oracle-model)

SP1 utilizes the Poseidon2 hash function over the BabyBear field with a width of 16, rate of 8, capacity of 8, SBOX degree of 7, and 8 external rounds with 13 internal rounds. These parameters were used in [Plonky3](https://github.com/Plonky3/Plonky3/blob/main/poseidon2/src/round_numbers.rs#L42). Readers are referred to the Plonky3 documentation above for more details and theoretical background on the parameter selection for Poseidon2.

Using the [Random Oracle Model](https://en.wikipedia.org/wiki/Random_oracle), we assume our system remains as secure as if Poseidon2 was replaced with a random oracle. This assumption establishes the security of the [Fiat-Shamir transform](https://en.wikipedia.org/wiki/Fiat–Shamir_heuristic), which converts an interactive protocol into a non-interactive one. This is a common cryptographic assumption used by many teams in the domain; see also the [Poseidon Initiative](https://www.poseidon-initiative.info/).

### Conjectures for FRI's Security[​](https://docs.succinct.xyz/docs/sp1/security/security-model#conjectures-for-fris-security)

SP1 uses Conjecture 8.4 from the paper ["Proximity Gaps for Reed-Solomon Codes"](https://eprint.iacr.org/2020/654.pdf). Based on this conjecture, section 3.9.2 of [ethSTARK documentation](https://eprint.iacr.org/2021/582.pdf) describes the number of FRI queries required to achieve a certain level of security, depending on the blowup factor. Additionally, proof of work is used to reduce the required number of FRI queries, as explained in section 3.11.3 of the ethSTARK documentation.

SP1's FRI parameters have num\_queries = 100 / log\_blowup with proof\_of\_work\_bits = 16, providing at least 100 bits of security based on these conjectures.

### Recursion's Overhead in Security[​](https://docs.succinct.xyz/docs/sp1/security/security-model#recursions-overhead-in-security)

We assume that recursive proofs do not incur a loss in security as the number of recursive steps increases. This assumption is widely accepted for recursion-based approaches.

### Security of Elliptic Curves over Extension Fields[​](https://docs.succinct.xyz/docs/sp1/security/security-model#security-of-elliptic-curves-over-extension-fields)

SP1 assumes that the discrete logarithm problem on the elliptic curve over the degree-7 extension of BabyBear is computationally hard. The selected instantiation of the elliptic curve satisfies the criteria outlined in [SafeCurves](https://safecurves.cr.yp.to/index.html), including high embedding degree, prime group order, and a large CM discriminant.

An analysis based on Thomas Pornin's paper ["EcGFp5: a Specialized Elliptic Curve"](https://eprint.iacr.org/2022/274.pdf), confirmed that the selected elliptic curve provides at least 100 bits of security against known attacks.

This assumption is used in our new memory argument. For more details, see [our notes](https://docs.succinct.xyz/docs/static/SP1_Turbo_Memory_Argument.pdf) explaining how it works.

### Groth16, PLONK, and the Zero-Knowledgeness of SP1[​](https://docs.succinct.xyz/docs/sp1/security/security-model#groth16-plonk-and-the-zero-knowledgeness-of-sp1)

SP1 utilizes [Gnark's](https://github.com/Consensys/gnark) implementation of Groth16 or PLONK over the BN254 curve to compress a STARK proof into a SNARK proof, which is then used for on-chain verification. SP1 assumes all cryptographic assumptions required for the security of Groth16 and PLONK. While our implementations of Groth16 and PLONK are zero-knowledge, individual STARK proofs in SP1 do not currently satisfy the zero-knowledge property.

Program Safety Requirements[​](https://docs.succinct.xyz/docs/sp1/security/security-model#program-safety-requirements)
----------------------------------------------------------------------------------------------------------------------

Since SP1 only aims to provide proof of correct execution for the user-provided program, it is crucial for users to make sure that **their programs are secure**.

SP1 assumes that the program compiled into SP1 is non-malicious. This includes that the program is memory-safe and the compiled ELF binary has not been tampered with. Compiling unsafe programs with undefined behavior into SP1 could result in undefined or even malicious behavior being provable and verifiable within SP1. Therefore, developers must ensure the safety of their code and the correctness of their SP1 usage through the appropriate toolchain. Similarly, users using SP1's patched crates must ensure that their code is secure when compiled with the original crates. SP1 also has [requirements for safe usage of SP1 Precompiles](https://docs.succinct.xyz/docs/sp1/security/safe-precompile-usage), which must be ensured by the developers.

Additionally, SP1 assumes that 0 is not a valid program counter in the compiled program.

Trusted Setup[​](https://docs.succinct.xyz/docs/sp1/security/security-model#trusted-setup)
------------------------------------------------------------------------------------------

The Groth16 and PLONK protocols require a trusted setup to securely setup the proof systems. For PLONK, SP1 relies on the trusted setup ceremony conducted by [Aztec Ignition](https://github.com/AztecProtocol/ignition-verification). For Groth16, SP1 conducted a trusted setup among several contributors to enable its use in the zero-knowledge proof generation pipeline.

### Purpose[​](https://docs.succinct.xyz/docs/sp1/security/security-model#purpose)

A trusted setup ceremony generates cryptographic parameters essential for systems like Groth16 and PLONK. These parameters ensure the validity of proofs and prevent adversaries from creating malicious or invalid proofs. However, the security of the trusted setup process relies on the critical assumption that at least one participant in the ceremony securely discards their intermediary data (commonly referred to as "toxic waste"). If this assumption is violated, the security of the proof system can be compromised.

### Options[​](https://docs.succinct.xyz/docs/sp1/security/security-model#options)

SP1 provides two trusted setup options, depending on user preferences and security requirements:

**PLONK’s Universal Trusted Setup:**

For PLONK, SP1 uses the [Aztec Ignition](https://aztec.network/blog/announcing-ignition) ceremony, which is a universal trusted setup designed for reuse across multiple circuits. This approach eliminates the need for circuit-specific ceremonies and minimizes trust assumptions, making it a robust and widely trusted solution.

The details of SP1's usage of this trusted setup can be found in our repository [here](https://github.com/succinctlabs/sp1/blob/dev/crates/recursion/gnark-ffi/go/sp1/trusted_setup/trusted_setup.go) using [Gnark's ignition verifier](https://github.com/Consensys/gnark-ignition-verifier).

The only downside of using PLONK is that it's proving time is slower than Groth16 by 3-4x.

**Groth16 Circuit-Specific Trusted Setup:**

For Groth16, Succinct conducted a circuit-specific trusted setup ceremony among several contributors to the project. While every effort was made to securely generate and discard intermediary parameters following best practices, circuit-specific ceremonies inherently carry higher trust assumptions. The contributors are the following:

1.  [John Guibas](https://github.com/jtguibas)
    
2.  [Uma Roy](https://github.com/puma314)
    
3.  [Tamir Hemo](https://github.com/tamirhemo)
    
4.  [Chris Tian](https://github.com/ctian1)
    
5.  [Eli Yang](https://github.com/eliy10)
    
6.  [Kaylee George](https://github.com/kayleegeorge)
    
7.  [Ratan Kaliani](https://github.com/ratankaliani)
    

The trusted setup artifacts along with the individual contributions can be downloaded from this following [archive](https://sp1-circuits.s3.us-east-2.amazonaws.com/v4.0.0-rc.3-trusted-setup.tar.gz) and were generate by [Semaphore](https://github.com/jtguibas/semaphore-gnark-11/tree/john/gnark-11) which was originally developed by [Worldcoin](https://world.org/).

Users uncomfortable with these security assumptions are strongly encouraged to use PLONK instead.

Approved Prover[​](https://docs.succinct.xyz/docs/sp1/security/security-model#approved-prover)
----------------------------------------------------------------------------------------------

Zero-knowledge proof (ZKP) systems are highly advanced and complex pieces of software that push the boundaries of cryptographic innovation. As with any complex system, the possibility of bugs or vulnerabilities cannot be entirely eliminated. In particular, issues in the prover implementation may lead to incorrect proofs or security vulnerabilities that could compromise the integrity of the entire proof system.

To mitigate these risks, we officially recommend the use of an approved prover for any application handling critical or sensitive amounts of value. An approved prover refers to an implementation where there is a list of whitelisted provers or oracles who provide an additional sanity check that the proof's claimed outputs are correct.

Over time, as the ecosystem matures and the understanding of ZKP systems improves, we expect to relax these restrictions. Advances in formal verification, fuzz testing, and cryptographic research may provide new tools and methods to achieve high levels of security and confidence of prover implementations.

We strongly advise users to:

*   Use only Succinct approved versions of the prover software for critical applications.
    
*   Follow updates and recommendations from the SP1 team regarding approved provers.
    
*   Regularly apply security patches and updates to the prover software.
    

This careful approach ensures that applications using SP1 maintain the highest possible level of security, while still leaving room for innovation and growth in the ZKP ecosystem.

RV32IM Standards Compliance
===========================

SP1 is a specialized implementation of the RISC-V RV32IM standard and aligns with the fundamental philosophy of RISC-V, which emphasizes customization and flexibility over rigid adherence to a fixed set of instructions.

Notably, RISC-V is designed as a modular ISA framework that encourages implementers to adapt and specialize its base specifications to meet unique application requirements. SP1, which is tailored for zero-knowledge proving workloads, embodies this philosophy by introducing minor adjustments that enhance proving efficiency while adhering to the core RV32IM requirements. These design choices reflect the intent of RISC-V to act as a “skeleton” rather than an immutable standard as outlined in the [RISC-V specification](https://riscv.org/wp-content/uploads/2017/05/riscv-spec-v2.2.pdf):

> RISC-V has been designed to support extensive customization and specialization. The base integer ISA can be extended with one or more optional instruction-set extensions, but the base integer instructions cannot be redefined. ... The base is carefully restricted to a minimal set of instructions sufficient to provide a reasonable target for compilers, assemblers, linkers, and operating systems (with additional supervisor-level operations), and so provides a convenient ISA and software toolchain “skeleton” around which more customized processor ISAs can be built.

SP1’s primary customizations, such as requiring aligned memory access and reserving specific memory regions, are implementation details optimized for zkVMs. These modifications are consistent with RISC-V’s allowance for customization, as the specification explicitly permits implementers to define legal address spaces and undefined behaviors.

_This topic was thoroughly investigated by external auditors, including rkm0959, Zellic, samczsun, and others. The audit report by Zellic on this subject can be found_ [_here_](https://github.com/succinctlabs/sp1/tree/dev/audits)_._

Implementation Details[​](https://docs.succinct.xyz/docs/sp1/security/rv32im-implementation#implementation-details)
-------------------------------------------------------------------------------------------------------------------

In this section, we outline the specific customizations made to SP1's implementation of the RISC-V RV32IM standard to simplify constraints and improve proving time.

### Reserved Memory Regions[​](https://docs.succinct.xyz/docs/sp1/security/rv32im-implementation#reserved-memory-regions)

SP1 reserves the following memory regions:

*   0x0 to 0x1F inclusive are reserved for registers. Writing to these addresses will modify register state and cause undefined behavior. SP1's AIRs also constrain that memory opcodes do not access these addresses.
    
*   0x20 to 0x78000000 inclusive are reserved for the heap allocator. Writing to addresses outside this region will cause undefined behavior.
    

The RISC-V standard permits implementers to define which portions of the address space are legal to access and does not prohibit the specification of undefined behavior. SP1 adheres to this flexibility by defining valid memory regions from 0x20 to 0x78000000, with accesses outside this range constituting undefined behavior. This design choice aligns with common practices in hardware platforms, where reserved or invalid memory regions serve specific purposes, such as [DMA](https://en.wikipedia.org/wiki/Direct_memory_access) or [MMIO](https://en.wikipedia.org/wiki/Memory-mapped_I/O_and_port-mapped_I/O), and accessing them can result in unpredictable behavior. Compared to real-world systems like x86 and ARM, SP1's memory map is neither that unusual nor complex.

In practical terms, undefined behavior caused by accessing illegal memory regions reflects faults in the program rather than the platform. Such behavior is consistent with other hardware environments.

### Aligned Memory Access[​](https://docs.succinct.xyz/docs/sp1/security/rv32im-implementation#aligned-memory-access)

Memory access must be "aligned". The alignment is automatically enforced by all programs compiled through the official SP1 RISC-V toolchain. SP1's AIRs also constrain that these alignment rules are followed:

*   LW/SW memory access must be word aligned.
    
*   LH/LHU/SH memory access must be half-word aligned.
    

The RISC-V standard does not explicitly prohibit implementers from requiring aligned memory access, leaving room for such decisions based on specific implementation needs. SP1 enforces memory alignment as part of its design, an approach that aligns with practices in many hardware systems where alignment is standard to optimize performance and simplify implementation. This design choice is well-documented and does not conflict with RISC-V’s flexibility for implementation-specific optimizations.

In practice, SP1’s memory alignment requirement does not impose a significant burden on developers since it is clearly documented that programs should be compiled with the SP1 toolchain.

### ECALL Instruction[​](https://docs.succinct.xyz/docs/sp1/security/rv32im-implementation#ecall-instruction)

The ECALL instruction in SP1 is used for system calls and precompiles, adhering to a specific convention for its proper use. Syscall IDs must be valid and loaded into register T0, with arguments placed in registers A0 and A1. If these arguments are memory addresses, they are required to be word-aligned. This convention ensures clarity and consistency in how system calls are handled. Failure to follow these conventions can result in undefined behavior.

### FENCE, WFI, MRET, and CSR related instructions[​](https://docs.succinct.xyz/docs/sp1/security/rv32im-implementation#fence-wfi-mret-and-csr-related-instructions)

SP1 marks the FENCE, WFI, MRET, and CSR-related instructions as not implemented and disallowed within the SP1 zkVM. This decision reflects the unique requirements and constraints of SP1's zkVM environment, where these instructions are unnecessary or irrelevant to its intended functionality. By omitting these instructions, SP1 simplifies its implementation, focusing on the subset of RISC-V instructions that are directly applicable to the application.

Security Considerations[​](https://docs.succinct.xyz/docs/sp1/security/rv32im-implementation#security-considerations)
---------------------------------------------------------------------------------------------------------------------

While SP1's customization of RISC-V could theoretically be exploited to cause undefined behavior or divergent execution from other platforms, such scenarios require a deliberately malicious program. The SP1 security model assumes that programs are honestly compiled, as malicious bytecode could otherwise exploit program execution and I/O. Programs which trigger undefined behavior are considered improperly designed for the environment, not evidence of noncompliance in SP1.

In practice, developers are proving their own applications and must be fully aware of the behavior of their source code and the environment they are running in. If an attacker can insert malicious code into a program, there are several trivial ways to control the programs behavior beyond relying on these undefined behaviors to trigger divergent execution. The customizations described in this document do not meaningfully change the attack surface of the SP1 zkVM.

Safe Usage of SP1 Precompiles

This section outlines the key assumptions and properties of each precompile. As explained in [Precompiles](https://docs.succinct.xyz/docs/sp1/writing-programs/precompiles), we recommend you to interact with precompiles through [patches](https://docs.succinct.xyz/docs/sp1/writing-programs/patched-crates). Advanced users interacting directly with the precompiles are expected to ensure these assumptions are met.

Do not use direct ECALL[​](https://docs.succinct.xyz/docs/sp1/security/safe-precompile-usage#do-not-use-direct-ecall)
---------------------------------------------------------------------------------------------------------------------

If you need to interact with the precompiles directly, you must use the API described in [Precompiles](https://docs.succinct.xyz/docs/sp1/writing-programs/precompiles) instead of making the ecall directly using unsafe Rust. As some of our syscalls have critical functionalities and complex security properties around them, **we highly recommend not calling the syscalls directly with ecall**. For example, directly calling HALT to stop the program execution leads to security vulnerabilities. As in our [security model](https://docs.succinct.xyz/docs/sp1/security/security-model), it is critical for safe usage that the program compiled into SP1 is correct.

Alignment of Pointers[​](https://docs.succinct.xyz/docs/sp1/security/safe-precompile-usage#alignment-of-pointers)
-----------------------------------------------------------------------------------------------------------------

For all precompiles, any pointer with associated data must be a valid pointer aligned to a four-byte boundary. This requirement applies to all precompiles related to hashing, field operations, and elliptic curve operations.

Canonical Field Inputs[​](https://docs.succinct.xyz/docs/sp1/security/safe-precompile-usage#canonical-field-inputs)
-------------------------------------------------------------------------------------------------------------------

Certain precompiles handle non-native field arithmetic, such as field operation and elliptic curve precompiles. These precompiles take field inputs as arrays of u32 values. In such cases, the u32 values must represent the field element in its canonical form. For example, in a finite field Fp, the value 1 must be represented by u32 limbs that encode 1, rather than p + 1 or 2 \* p + 1. Using non-canonical representations may result in unverifiable SP1 proofs. Note that our field operation and elliptic curve operation precompiles are constrained to return field elements in their canonical representations.

Elliptic Curve Precompiles[​](https://docs.succinct.xyz/docs/sp1/security/safe-precompile-usage#elliptic-curve-precompiles)
---------------------------------------------------------------------------------------------------------------------------

The elliptic curve precompiles assume that inputs are valid elliptic curve points. Since this validity is not enforced within the precompile circuits, it is the responsibility of the user program to verify that the points lie on the curve. Given valid elliptic curve points as inputs, the precompile will perform point addition or doubling as expected.

For Weierstrass curves, the add precompile additionally constrains that the two elliptic curve points have different x-coordinates over the base field. Attempting to double a point by sending two equal curve points to the add precompile will result in unverifiable proofs. Additionally, cases where an input or output point is a point at infinity cannot be handled by the add or double precompile. It is the responsibility of the user program to handle such edge cases of Weierstrass addition correctly when invoking these precompiles.

U256 Precompile[​](https://docs.succinct.xyz/docs/sp1/security/safe-precompile-usage#u256-precompile)
-----------------------------------------------------------------------------------------------------

The sys\_bigint precompile efficiently constrains the computation of (x \* y) % modulus, where x, y, modulus are all uint256. Here, the precompile requires that x \* y < 2^256 \* modulus for the resulting SP1 proof to be verifiable. This condition is satisfied, for example, when at least one of x or y is canonical, (i.e., less than the modulus). It is the responsibility of the user program to ensure that this requirement is met.