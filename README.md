<div align="center">
  <img src="assets/site-icon.svg" width="92" alt="AI for Games icon">
  <h1>Awesome AI for Games</h1>
  <p><strong>A curated collection of research on AI and foundation models for games.</strong></p>
  <p>Agents · world and player models · game design · development · runtime generation · testing</p>

  <a href="https://awesome.re"><img src="https://awesome.re/badge-flat2.svg" alt="Awesome"></a>
  <img src="https://img.shields.io/badge/papers-334-168f91?style=flat-square" alt="334 papers">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-c78b1e?style=flat-square" alt="MIT license"></a>
</div>

---

## About

This repository is a direct, browsable reading list for research in which AI participates in interactive games or game creation. It includes historical foundations and recent work on language models, multimodal agents, learned game worlds, code agents, and tool-using systems.

The collection accompanies the forthcoming survey **AI for Games in the Foundation Model Era**. The current manuscript draft is not part of this repository.

> Every entry links directly to its canonical paper or project page.

## Contents

- [Game-Playing Agents](#game-playing-agents) (80)
- [Game and Player Models](#game-and-player-models) (105)
- [Game Design and Content Generation](#game-design-and-content-generation) (36)
- [Game Development and Maintenance](#game-development-and-maintenance) (7)
- [Runtime Generation and Adaptation](#runtime-generation-and-adaptation) (12)
- [Game Testing and Evaluation](#game-testing-and-evaluation) (94)
- [Contributing](#contributing)

## Collections

| Collection | Focus | Papers |
| --- | --- | ---: |
| **[Game-Playing Agents](#game-playing-agents)** | Policies, planners, generalist agents, embodied control, cooperation, and situated action. | 80 |
| **[Game and Player Models](#game-and-player-models)** | World models, learned simulators, state representations, dynamics prediction, and player modeling. | 105 |
| **[Game Design and Content Generation](#game-design-and-content-generation)** | Levels, worlds, assets, mechanics, narratives, procedural generation, and co-creative tools. | 36 |
| **[Game Development and Maintenance](#game-development-and-maintenance)** | Code, scenes, engine projects, tool-using development agents, debugging, repair, and revision. | 7 |
| **[Runtime Generation and Adaptation](#runtime-generation-and-adaptation)** | Characters, dialogue, quests, narrative, personalization, and content generated during play. | 12 |
| **[Game Testing and Evaluation](#game-testing-and-evaluation)** | Automated playtesting, verification, benchmarks, model judges, coverage, and player evidence. | 94 |

Papers are listed newest first. ⭐ marks a foundational or widely used reference selected in the catalog.

## Game-Playing Agents

> Policies, planners, generalist agents, embodied control, cooperation, and situated action.

### 2026

- [Twin: Playing an Unknown Game with a Test-Time Digital Twin](https://arxiv.org/abs/2608.14490) — *arXiv*.
- [AI-Native Games: A Survey and Roadmap](https://arxiv.org/abs/2607.00527) — *arXiv*.
- ⭐ [One Policy, Infinite NPCs: Persona-Traceable Shared RL Policies for Scalable Game Agents](https://arxiv.org/abs/2605.23652) — *arXiv*.
- [Towards Generalist Game Players: An Investigation of Foundation Models in the Game Multiverse](https://arxiv.org/abs/2605.09965) — *arXiv*.
- [Agentic World Modeling: Foundations, Capabilities, Laws, and Beyond](https://arxiv.org/abs/2604.22748) — *arXiv*.
- ⭐ [CASCADE: A Cascading Architecture for Social Coordination with Controllable Emergence at Low Cost](https://arxiv.org/abs/2604.03091) — *arXiv*.
- [GameVerse: Can Vision-Language Models Learn from Video-based Reflection?](https://arxiv.org/abs/2603.06656) — *arXiv*.
- [MineEvolve: Self-Evolution with Accumulated Knowledge for Long-Horizon Embodied Minecraft Agents](https://arxiv.org/abs/2603.13131v1) — *arXiv*.
- [Resource-constrained Amazons chess decision framework integrating large language models and graph attention](https://arxiv.org/abs/2603.10512) — *arXiv*.
- [The PokeAgent Challenge: Competitive and Long-Context Learning at Scale](https://arxiv.org/abs/2603.15563) — *NeurIPS 2025 Competition Track*.
- [BotzoneBench: Scalable LLM Evaluation via Graded AI Anchors](https://arxiv.org/abs/2602.13214) — *arXiv*.
- [ProxyWar: Dynamic Assessment of LLM Code Generation in Game Arenas](https://conf.researchr.org/details/icse-2026/icse-2026-research-track/178/ProxyWar-Dynamic-Assessment-of-LLM-Code-Generation-in-Game-Arenas) — *ICSE 2026*.
- [NitroGen: An Open Foundation Model for Generalist Gaming Agents](https://arxiv.org/abs/2601.02427) — *arXiv*.

### 2025

- [Do Persona-Infused LLMs Affect Performance in a Strategic Reasoning Game?](https://aclanthology.org/2025.ijcnlp-long.186/) — *IJCNLP-AACL 2025*.
- [Game-TARS: Pretrained Foundation Models for Scalable Generalist Multimodal Game Agents](https://arxiv.org/abs/2510.23691) — *arXiv*.
- [FlashAdventure: A Benchmark for GUI Agents Solving Full Story Arcs in Diverse Adventure Games](https://aclanthology.org/2025.emnlp-main.1192/) — *EMNLP 2025*.
- [VistaWise: Building Cost-Effective Agent with Cross-Modal Knowledge Graph for Minecraft](https://aclanthology.org/2025.emnlp-main.1111/) — *EMNLP 2025*.
- [General Modular Harness for LLM Agents in Multi-Turn Gaming Environments](https://arxiv.org/abs/2507.11633) — *ICML MAS workshop*.
- [VS-Bench: Evaluating VLMs for Strategic Abilities in Multi-Agent Environments](https://arxiv.org/abs/2506.02387) — *arXiv*.
- [Learning to Play Like Humans: A Framework for LLM Adaptation in Interactive Fiction Games](https://aclanthology.org/2025.findings-acl.531/) — *ACL Findings 2025*.
- [lmgame-Bench: How Good are LLMs at Playing Games?](https://openreview.net/forum?id=qeziG97WUZ) — *ICLR 2026*.
- [VideoGameBench: Can Vision-Language Models complete popular video games?](https://arxiv.org/abs/2505.18134) — *arXiv*.
- [CombatVLA: An Efficient Vision-Language-Action Model for Combat Tasks in 3D Action Role-Playing Games](https://openaccess.thecvf.com/content/ICCV2025/html/Chen_CombatVLA_An_Efficient_Vision-Language-Action_Model_for_Combat_Tasks_in_3D_ICCV_2025_paper.html) — *ICCV 2025*.
- [Cultivating Gaming Sense for Yourself: Making VLMs Gaming Experts](https://aclanthology.org/2025.acl-long.643/) — *ACL 2025*.
- [DSGBench: A Diverse Strategic Game Benchmark for Evaluating LLM-based Agents in Complex Decision-Making Environments](https://arxiv.org/abs/2503.06047) — *arXiv*.
- [JARVIS-VLA: Post-Training Large-Scale Vision Language Models to Play Visual Games with Keyboards and Mouse](https://aclanthology.org/2025.findings-acl.920/) — *ACL Findings 2025*.
- [Reflection of Episodes: Learning to Play Game from Expert and Self Experiences](https://arxiv.org/abs/2502.13388) — *arXiv*.

### 2024

- [GAMEBoT: Transparent Assessment of LLM Reasoning in Games](https://aclanthology.org/2025.acl-long.378/) — *ACL 2025*.
- [Can VLMs Play Action Role-Playing Games? Take Black Myth Wukong as a Study Case](https://arxiv.org/abs/2409.12889) — *NeurIPS 2024 Workshop*.
- [Self-Reflection in Large Language Model Agents: Effects on Problem-Solving Performance](https://ieeexplore.ieee.org/document/10852426) — *FLLM 2024*.
- [A Survey on Large Language Model-Based Game Agents](https://arxiv.org/abs/2404.02039) — *ACM Computing Surveys*.
- [GPT for Games: A Scoping Review (2020--2023)](https://arxiv.org/abs/2404.17794) — *arXiv*.
- [A Survey on Game Playing Agents and Large Models: Methods, Applications, and Challenges](https://arxiv.org/abs/2403.10249) — *arXiv*.
- [Large Language Models and Video Games: A Preliminary Scoping Review](https://arxiv.org/abs/2403.02613) — *arXiv*.
- [Large Language Models and Games: A Survey and Roadmap](https://arxiv.org/abs/2402.18659) — *IEEE Transactions on Games*.
- ⭐ [SwarmBrain: Embodied Agent for Real-Time Strategy Game StarCraft II via Large Language Models](https://arxiv.org/abs/2401.17749) — *arXiv*.

### 2023

- [Large Language Models Play StarCraft II: Benchmarks and A Chain of Summarization Approach](https://proceedings.neurips.cc/paper_files/paper/2024/hash/f0ebc318e2df08360b2df559e81602e5-Abstract-Conference.html) — *NeurIPS 2024*.
- [JARVIS-1: Open-World Multi-task Agents with Memory-Augmented Multimodal Language Models](https://arxiv.org/abs/2311.05997) — *arXiv*.
- ⭐ [STORM: Efficient Stochastic Transformer based World Models for Reinforcement Learning](https://arxiv.org/abs/2310.09615) — *NeurIPS 2023*.
- [STEVE-1: A Generative Model for Text-to-Behavior in Minecraft](https://arxiv.org/abs/2306.00937) — *NeurIPS 2023*.
- [Voyager: An Open-Ended Embodied Agent with Large Language Models](https://arxiv.org/abs/2305.16291) — *NeurIPS 2023 Workshop IMOL*.
- ⭐ [Generative Agents: Interactive Simulacra of Human Behavior](https://arxiv.org/abs/2304.03442) — *UIST*.
- ⭐ [Skill Reinforcement Learning and Planning for Open-World Long-Horizon Tasks](https://arxiv.org/abs/2303.16563) — *arXiv*.
- ⭐ [Transformers are Sample-Efficient World Models](https://arxiv.org/abs/2209.00588) — *ICLR 2023*.
- [Describe, Explain, Plan and Select: Interactive Planning with Large Language Models Enables Open-World Multi-Task Agents](https://arxiv.org/abs/2302.01560) — *NeurIPS 2023*.

### 2022

- [MineDojo: Building Open-Ended Embodied Agents with Internet-Scale Knowledge](https://arxiv.org/abs/2206.08853) — *NeurIPS 2022*.
- ⭐ [Multi-Game Decision Transformers](https://arxiv.org/abs/2205.15241) — *NeurIPS 2022*.

### 2020

- ⭐ [Winning Is Not Everything: Enhancing Game Development with Intelligent Agents](https://doi.org/10.1109/TG.2020.2990865) — *IEEE Transactions on Games*.
- ⭐ [Agent57: Outperforming the Atari Human Benchmark](https://proceedings.mlr.press/v119/badia20a.html) — *ICML 2020*.

### 2019

- ⭐ [Dota 2 with Large Scale Deep Reinforcement Learning](https://arxiv.org/abs/1912.06680) — *arXiv*.
- ⭐ [Dream to Control: Learning Behaviors by Latent Imagination](https://arxiv.org/abs/1912.01603) — *ICLR 2020*.
- [Leveraging Procedural Generation to Benchmark Reinforcement Learning](https://arxiv.org/abs/1912.01588) — *ICML 2020*.
- ⭐ [Learning to Speak and Act in a Fantasy Text Adventure Game](https://doi.org/10.18653/v1/D19-1062) — *EMNLP-IJCNLP 2019*.
- ⭐ [Mastering Atari, Go, Chess and Shogi by Planning with a Learned Model](https://arxiv.org/abs/1911.08265) — *Nature*.
- ⭐ [Wuji: Automatic Online Combat Game Testing Using Evolutionary Deep Reinforcement Learning](https://doi.org/10.1109/ASE.2019.00077) — *ASE 2019*.
- ⭐ [Grandmaster Level in StarCraft II Using Multi-Agent Reinforcement Learning](https://www.nature.com/articles/s41586-019-1724-z) — *Nature*.
- ⭐ [On the Utility of Learning about Humans for Human-AI Coordination](https://arxiv.org/abs/1910.05789) — *NeurIPS 2019*.
- ⭐ [Model-Based Reinforcement Learning for Atari](https://arxiv.org/abs/1903.00374) — *ICLR 2020*.

### 2018

- [Artificial Intelligence and Games](https://doi.org/10.1007/978-3-319-63519-4) — *Springer*.
- ⭐ [Learning Latent Dynamics for Planning from Pixels](https://arxiv.org/abs/1811.04551) — *ICML 2019*.
- ⭐ [Human-Like Playtesting with Deep Learning](https://doi.org/10.1109/CIG.2018.8490442) — *IEEE CIG 2018*.
- ⭐ [World Models](https://arxiv.org/abs/1803.10122) — *arXiv*.
- [General Video Game AI: A Multi-Track Framework for Evaluating Agents, Games and Content Generation Algorithms](https://arxiv.org/abs/1802.10363) — *IEEE Transactions on Games*.

### 2017

- ⭐ [A General Reinforcement Learning Algorithm that Masters Chess, Shogi, and Go through Self-Play](https://arxiv.org/abs/1712.01815) — *Science*.
- ⭐ [Mastering the Game of Go without Human Knowledge](https://doi.org/10.1038/nature24270) — *Nature*.
- ⭐ [Imagination-Augmented Agents for Deep Reinforcement Learning](https://arxiv.org/abs/1707.06203) — *NeurIPS 2017*.

### 2016

- ⭐ [The Malmo Platform for Artificial Intelligence Experimentation](https://arxiv.org/abs/1609.05521) — *IJCAI 2016*.
- ⭐ [Mastering the Game of Go with Deep Neural Networks and Tree Search](https://doi.org/10.1038/nature16961) — *Nature*.

### 2015

- [A Panorama of Artificial and Computational Intelligence in Games](https://doi.org/10.1109/TCIAIG.2014.2339221) — *IEEE TCIAIG*.
- ⭐ [Human-Level Control through Deep Reinforcement Learning](https://doi.org/10.1038/nature14236) — *Nature*.

### 2013

- ⭐ [Prom Week: Designing Past the Game/Story Dilemma](http://www.fdg2013.org/program/papers/paper13_mccoy_etal.pdf) — *FDG*.

### 2012

- ⭐ [The Arcade Learning Environment: An Evaluation Platform for General Agents](https://arxiv.org/abs/1207.4708) — *Journal of Artificial Intelligence Research*.
- [Game AI Revisited](https://doi.org/10.1145/2212908.2212954) — *ACM Computing Frontiers*.

### 2006

- ⭐ [Bandit Based Monte-Carlo Planning](https://doi.org/10.1007/11871842_29) — *ECML 2006*.

### 2005

- ⭐ [General Game Playing: Overview of the AAAI Competition](https://doi.org/10.1609/aimag.v26i2.1813) — *AI Magazine*.

### 2002

- ⭐ [Deep Blue](https://doi.org/10.1016/S0004-3702(01)00129-1) — *Artificial Intelligence*.

### 1995

- ⭐ [Temporal Difference Learning and TD-Gammon](https://doi.org/10.1145/203330.203343) — *Communications of the ACM*.

### 1990

- ⭐ [Integrated Architectures for Learning, Planning, and Reacting Based on Approximating Dynamic Programming](https://doi.org/10.1016/B978-1-55860-141-3.50030-4) — *ICML 1990*.

### 1959

- ⭐ [Some Studies in Machine Learning Using the Game of Checkers](https://doi.org/10.1147/rd.33.0210) — *IBM Journal of Research and Development*.

### 1950

- ⭐ [Programming a Computer for Playing Chess](https://doi.org/10.1080/14786445008521796) — *Philosophical Magazine*.

## Game and Player Models

> World models, learned simulators, state representations, dynamics prediction, and player modeling.

### 2026

- [ForgeWM: Progressive Causal Training for Few-Step Action-Conditioned Video World Models](https://arxiv.org/abs/2608.14022) — *arXiv*.
- ⭐ [Game2World Engine: Unlocking In-the-Wild Gameplay Videos for World Model Training](https://arxiv.org/abs/2608.24680) — *arXiv*.
- ⭐ [ReWorld: An Interactive World Model with Long-Horizon Memory](https://arxiv.org/abs/2608.23565) — *arXiv*.
- [WorldMind: Decoupled Game World Model for State-Aware NPC Behavior](https://arxiv.org/abs/2608.21439) — *arXiv*.
- [AlayaWorld: Long-Horizon and Playable Video World Generation](https://arxiv.org/abs/2607.06291) — *arXiv / listed venue*.
- [From Pixels to States: Rethinking Interactive World Models as Game Engines](https://arxiv.org/abs/2607.14076) — *arXiv / listed venue*.
- [Multiplayer Interactive World Models with Representation Autoencoders](https://arxiv.org/abs/2607.05352) — *arXiv / listed venue*.
- [StatePlay: State-Aware Game World Models for Mechanics-Consistent Generation](https://arxiv.org/abs/2607.26754) — *arXiv*.
- ⭐ [ActWorld: From Explorable to Interactive World Model via Action-Aware Memory](https://arxiv.org/abs/2606.17730) — *arXiv*.
- [BadWorld: Adversarial Attacks on World Models](https://arxiv.org/abs/2606.16519) — *arXiv / listed venue*.
- [Towards Interactive Video World Modeling: Frontiers, Challenges, Benchmarks, and Future Trends](https://arxiv.org/abs/2606.01164) — *arXiv*.
- [Distilling Game Code World Model Generation into Lightweight Large Language Models](https://arxiv.org/abs/2605.24375) — *arXiv*.
- [Gamma-World: Generative Multi-Agent World Modeling Beyond Two Players](https://arxiv.org/abs/2605.28816) — *arXiv / listed venue*.
- [Incantation: Natural Language as the Action Interface for Multi-Entity Video World Models](https://arxiv.org/abs/2605.18601) — *arXiv*.
- [Light Interaction: Training-Free Inference Acceleration for Interactive Video World Models](https://arxiv.org/abs/2605.31158) — *arXiv / listed venue*.
- [minWM: A Full-Stack Open-Source Framework for Real-Time Interactive Video World Models](https://arxiv.org/abs/2605.30263) — *arXiv / listed venue*.
- [ReactiveGWM: Steering NPC in Reactive Game World Models](https://arxiv.org/abs/2605.15256) — *arXiv*.
- [SANA-WM: Efficient Minute-Scale World Modeling with Hybrid Linear Diffusion Transformer](https://arxiv.org/abs/2605.15178) — *arXiv / listed venue*.
- [SCOPE: Simulating Cross-game Operations in Playable Environments for FPS World Models](https://arxiv.org/abs/2605.23345) — *arXiv / listed venue*.
- [Actionparty: Multi-subject Action Binding in Generative Video Games](https://arxiv.org/abs/2604.02330) — *arXiv / listed venue*.
- [HY-World 2.0: A Multi-Modal World Model for Reconstructing, Generating, and Simulating 3D Worlds](https://arxiv.org/abs/2604.14268) — *arXiv / listed venue*.
- [Matrix-Game 3.0: Real-Time and Streaming Interactive World Model with Long-Horizon Memory](https://arxiv.org/abs/2604.08995) — *arXiv*.
- [MultiWorld: Scalable Multi-Agent Multi-View Video World Models](https://arxiv.org/abs/2604.18564) — *arXiv / listed venue*.
- [Beyond Pixel Histories: World Models with Persistent 3D State](https://arxiv.org/abs/2603.03482) — *arXiv / listed venue*.
- [MultiGen: Level-Design for Editable Multiplayer Worlds in Diffusion Game Engines](https://arxiv.org/abs/2603.06679) — *arXiv*.
- [WorldCam: Interactive Autoregressive 3D Gaming Worlds with Camera Pose as a Unifying Geometric Representation](https://arxiv.org/abs/2603.16871) — *arXiv*.
- [Implicit Strategic Optimization: Rethinking Long-Horizon Decision-Making in Adversarial Poker Environments](https://arxiv.org/abs/2602.08041) — *arXiv*.
- [LIVE: Long-horizon Interactive Video World Modeling](https://arxiv.org/abs/2602.03747) — *arXiv / listed venue*.
- [MAIN-VLA: Modeling Abstraction of Intention and eNvironment for Vision-Language-Action Models](https://arxiv.org/abs/2602.02212) — *arXiv*.
- [Mixture of Masters: Sparse Chess Language Models with Player Routing](https://arxiv.org/abs/2602.04447) — *arXiv*.
- [Solaris: Building a Multiplayer Video World Model in Minecraft](https://arxiv.org/abs/2602.22208) — *arXiv*.
- [VAM: Verbalized Action Masking for Controllable Exploration in RL Post-Training -- A Chess Case Study](https://arxiv.org/abs/2602.16833) — *arXiv*.
- [Advancing Open-source World Models](https://arxiv.org/abs/2601.20540) — *arXiv / listed venue*.
- [GameTalk: Training LLMs for Strategic Conversation](https://arxiv.org/abs/2601.16276) — *arXiv*.
- [Scaling Behavior Cloning Improves Causal Reasoning: An Open Model for Real-Time Video Game Playing](https://arxiv.org/abs/2601.04575) — *arXiv*.
- [StableWorld: Towards Stable and Consistent Long Interactive Video Generation](https://arxiv.org/abs/2601.15281) — *arXiv / listed venue*.

### 2025

- [Agent2World: Learning to Generate Symbolic World Models via Adaptive Multi-Agent Feedback](https://arxiv.org/abs/2512.22336) — *arXiv*.
- [RELIC: Interactive Video World Model with Long-Horizon Memory](https://arxiv.org/abs/2512.04040) — *arXiv / listed venue*.
- [SIMA 2: A Generalist Embodied Agent for Virtual Worlds](https://arxiv.org/abs/2512.04797) — *arXiv*.
- [Training One Model to Master Cross-Level Agentic Actions via Reinforcement Learning](https://arxiv.org/abs/2512.09706) — *arXiv*.
- [WorldPlay: Towards Long-Term Geometric Consistency for Real-Time Interactive World Modeling](https://arxiv.org/abs/2512.14614) — *arXiv / listed venue*.
- ⭐ [Hunyuan-GameCraft-2: Instruction-Following Interactive Game World Model](https://arxiv.org/abs/2511.23429) — *arXiv*.
- [IPR-1: Interactive Physical Reasoner](https://arxiv.org/abs/2511.15407) — *arXiv*.
- [Lumine: An Open Recipe for Building Generalist Agents in 3D Open Worlds](https://arxiv.org/abs/2511.08892) — *arXiv*.
- [PAN: A World Model for General, Interactable, and Long-Horizon World Simulation](https://arxiv.org/abs/2511.09057) — *arXiv*.
- [WorldGen: From Text to Traversable and Interactive 3D Worlds](https://arxiv.org/abs/2511.16825) — *arXiv / listed venue*.
- [Code World Models for General Game Playing](https://arxiv.org/abs/2510.04542) — *ICLR 2026*.
- [Learning to Play: A Multimodal Agent for 3D Game-Play](https://arxiv.org/abs/2510.16774) — *arXiv*.
- [MARSHAL: Incentivizing Multi-Agent Reasoning via Self-Play with Strategic LLMs](https://arxiv.org/abs/2510.15414) — *arXiv*.
- [Memory Forcing: Spatio-Temporal Memory for Consistent Scene Generation on Minecraft](https://arxiv.org/abs/2510.03198) — *arXiv / listed venue*.
- [OpenHA: A Series of Open-Source Hierarchical Agentic Models in Minecraft](https://arxiv.org/abs/2509.13347) — *arXiv*.
- [SpinGPT: A Large-Language-Model Approach to Playing Poker Correctly](https://arxiv.org/abs/2509.22387) — *ACG 2025*.
- [Training Agents Inside of Scalable World Models](https://arxiv.org/abs/2509.24527) — *arXiv / listed venue*.
- ⭐ [Genie 3: A New Frontier for World Models](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/) — *Google DeepMind announcement*.
- [Matrix-game 2.0: An open-source real-time and streaming interactive world model](https://arxiv.org/abs/2508.13009) — *arXiv*.
- [Reinforced Language Models for Sequential Decision Making](https://arxiv.org/abs/2508.10839) — *arXiv*.
- [Think in Games: Learning to Reason in Games via Reinforcement Learning with Large Language Models](https://arxiv.org/abs/2508.21365) — *arXiv*.
- [HunyuanWorld 1.0: Generating Immersive, Explorable, and Interactive 3D Worlds from Words or Pixels](https://arxiv.org/abs/2507.21809) — *arXiv / listed venue*.
- ⭐ [Learning to Imitate with Less: Efficient Individual Behavior Modeling in Chess](https://arxiv.org/abs/2507.21488) — *arXiv*.
- [Yume: An Interactive World Generation Model](https://arxiv.org/abs/2507.17744) — *arXiv / listed venue*.
- [From Virtual Games to Real-World Play](https://arxiv.org/abs/2506.18901) — *arXiv / listed venue*.
- [Hunyuan-gamecraft: High-dynamic Interactive Game Video Generation with Hybrid History Condition](https://arxiv.org/abs/2506.17201) — *arXiv / listed venue*.
- [Matrix-Game: Interactive World Foundation Model](https://arxiv.org/abs/2506.18701) — *arXiv*.
- [G1: Bootstrapping Perception and Reasoning Abilities of Vision-Language Model via Reinforcement Learning](https://arxiv.org/abs/2505.13426) — *arXiv*.
- [PLAICraft: Large-Scale Time-Aligned Vision-Speech-Action Dataset for Embodied AI](https://arxiv.org/abs/2505.12707) — *arXiv*.
- [Towards Efficient Online Tuning of VLM Agents via Counterfactual Soft Reinforcement Learning](https://openreview.net/forum?id=H76PMm7hf2) — *ICML 2025*.
- [Vid2World: Crafting Video Diffusion Models to Interactive World Models](https://arxiv.org/abs/2505.14357) — *arXiv / listed venue*.
- [Human-Level Competitive Pokémon via Scalable Offline Reinforcement Learning with Transformers](https://openreview.net/forum?id=b1BaJ1edFS) — *RL Conf. 2025*.
- [MineWorld: a Real-Time and Open-Source Interactive World Model on Minecraft](https://arxiv.org/abs/2504.08388) — *arXiv*.
- [WHAMM! Real-time world modelling of interactive environments.](https://www.microsoft.com/en-us/research/articles/whamm-real-time-world-modelling-of-interactive-environments/) — *Research blog*.
- [Worldmem: Long-term Consistent World Simulation with Memory](https://arxiv.org/abs/2504.12369) — *arXiv / listed venue*.
- [Empowering LLMs in Decision Games through Algorithmic Data Synthesis](https://arxiv.org/abs/2503.13980) — *ICLR 2025 Workshop*.
- [Model as a Game: On Numerical and Spatial Consistency for Generative Games](https://arxiv.org/abs/2503.21172) — *ICCV Workshop 2025*.
- [PokéChamp: an Expert-level Minimax Language Agent](https://arxiv.org/abs/2503.04094) — *ICML 2025*.
- [Learning Strategic Language Agents in the Werewolf Game with Iterative Latent Space Policy Optimization](https://openreview.net/forum?id=N2mOBiSqhc) — *ICML 2025*.
- [World and Human Action Models towards gameplay ideation](https://www.nature.com/articles/s41586-025-08600-3) — *Nature*.
- [GameFactory: Creating New Games with Generative Interactive Videos](https://arxiv.org/abs/2501.08325) — *ICCV 2025*.

### 2024

- ⭐ [Genie 2: A Large-Scale Foundation World Model](https://deepmind.google/blog/genie-2-a-large-scale-foundation-world-model/) — *Google DeepMind announcement*.
- [Playable Game Generation](https://arxiv.org/abs/2412.00887) — *arXiv*.
- [The Matrix: Infinite-Horizon World Generation with Real-Time Moving Control](https://arxiv.org/abs/2412.03568) — *arXiv / listed venue*.
- [GameGen-X: Interactive Open-world Game Video Generation](https://openreview.net/forum?id=8VG8tpPZhe) — *ICLR 2025*.
- [ROCKET-1: Mastering Open-World Interaction with Visual-Temporal Context Prompting](https://arxiv.org/abs/2410.17856) — *CVPR 2025*.
- [Scaling Offline Model-Based RL via Jointly-Optimized World-Action Model Pretraining](https://proceedings.iclr.cc/paper_files/paper/2025/hash/689cffc97600f9deb8374fc8fa918b8e-Abstract-Conference.html) — *ICLR 2025*.
- [Diffusion Models Are Real-Time Game Engines](https://arxiv.org/abs/2408.14837) — *ICLR 2025*.
- [OmniJARVIS: Unified Vision-Language-Action Tokenization Enables Open-World Instruction Following Agents](https://proceedings.neurips.cc/paper_files/paper/2024/hash/85f1225db986e629289f402c46eff1a4-Abstract-Conference.html) — *NeurIPS 2024*.
- [Aligning Agents like Large Language Models](https://arxiv.org/abs/2406.04208) — *arXiv*.
- ⭐ [Behavior Structformer: Learning Players Representations with Structured Tokenization](https://arxiv.org/abs/2406.05274) — *arXiv*.
- [Diffusion for World Modeling: Visual Details Matter in Atari](https://arxiv.org/abs/2405.12399) — *arXiv / listed venue*.
- ⭐ [player2vec: A Language Modeling Approach to Understand Player Behavior in Games](https://arxiv.org/abs/2404.04234) — *arXiv*.
- [Scaling Instructable Agents Across Many Simulated Worlds](https://arxiv.org/abs/2404.10179) — *arXiv*.
- [Video2game: Real-time Interactive Realistic and Browser-compatible Environment from a Single Video](https://arxiv.org/abs/2404.09833) — *arXiv / listed venue*.
- [Enhance Reasoning for Large Language Models in the Game Werewolf](https://arxiv.org/abs/2402.02330) — *arXiv*.
- [Genie: Generative Interactive Environments](https://arxiv.org/abs/2402.15391) — *ICML 2024*.
- [StarCraftImage: A Dataset For Prototyping Spatial Reasoning Methods For Multi-Agent Environments](https://cvpr.thecvf.com/virtual/2023/poster/21261) — *CVPR 2023*.

### 2023

- [Creative Agents: Empowering Agents with Imagination for Creative Tasks](https://arxiv.org/abs/2312.02519) — *arXiv*.
- [GROOT: Learning to Follow Instructions by Watching Gameplay Videos](https://proceedings.iclr.cc/paper_files/paper/2024/hash/16986b69068fbe6acf64eb6566519c74-Abstract-Conference.html) — *ICLR 2024*.
- [Language Agents with Reinforcement Learning for Strategic Play in the Werewolf Game](https://icml.cc/virtual/2024/poster/32805) — *ICML 2024*.
- [LLaMA-Rider: Spurring Large Language Models to Explore the Open World](https://aclanthology.org/2024.findings-naacl.292/) — *NAACL Findings 2024*.

### 2022

- [Video PreTraining (VPT): Learning to Act by Watching Unlabeled Online Videos](https://arxiv.org/abs/2206.11795) — *NeurIPS 2022*.

### 2021

- [Counter-Strike Deathmatch with Large-Scale Behavioural Cloning](https://ieeexplore.ieee.org/document/9893617) — *CoG 2022*.

### 2020

- [Learning to Simulate Dynamic Environments with GameGAN](https://arxiv.org/abs/2005.12126) — *CVPR 2020*.

### 2019

- [MineRL: A Large-Scale Dataset of Minecraft Demonstrations](https://www.ijcai.org/Proceedings/2019/339) — *IJCAI 2019*.

### 2017

- ⭐ [Recurrent Environment Simulators](https://openreview.net/forum?id=B1s6xvqlx) — *ICLR 2017*.

### 2015

- ⭐ [Action-Conditional Video Prediction Using Deep Networks in Atari Games](https://proceedings.neurips.cc/paper/2015/hash/6ba3af5d7b2790e73f0de32e5c8c1798-Abstract.html) — *NeurIPS 2015*.

### 2007

- ⭐ [Interactive Storytelling: A Player Modelling Approach](https://ojs.aaai.org/index.php/AIIDE/article/view/18780) — *AIIDE*.

## Game Design and Content Generation

> Levels, worlds, assets, mechanics, narratives, procedural generation, and co-creative tools.

### 2026

- [Beyond Asking: A Pipeline for Personalized Game Generation that Reads Players from Behavior](https://arxiv.org/abs/2608.16196) — *arXiv*.
- [GUI Agents for Continual Game Generation](https://arxiv.org/abs/2605.28258) — *arXiv*.
- ⭐ [LLMs are the Ideal Candidate for Mixed-Initiative Game Design Pillar Workflows](https://arxiv.org/abs/2605.09767) — *arXiv*.

### 2025

- [A Database-Driven Framework for 3D Level Generation with LLMs](https://doi.org/10.1609/aiide.v21i1.36840) — *AIIDE 2025*.
- ⭐ [Pixie: Code-Level Mechanic Generation for Game Designers](https://ojs.aaai.org/index.php/AIIDE/article/view/36824) — *AIIDE*.
- [90% Faster, 100% Code-Free: MLLM-Driven Zero-Code 3D Game Development](https://arxiv.org/abs/2509.26161) — *arXiv*.
- [Generative AI in Game Development: A Qualitative Research Synthesis](https://arxiv.org/abs/2509.11898) — *arXiv*.
- [UnrealLLM: Towards Highly Controllable and Interactable 3D Scene Generation by LLM-powered Procedural Content Generation](https://aclanthology.org/2025.findings-acl.994/) — *Findings of ACL 2025*.
- [Word2Minecraft: Generating 3D Game Levels through Large Language Models](https://arxiv.org/abs/2503.16536) — *arXiv*.

### 2024

- [NarrativeGenie: Generating Narrative Beats and Dynamic Storytelling with Large Language Models](https://doi.org/10.1609/aiide.v20i1.31868) — *AIIDE 2024*.
- [DreamGarden: A Designer Assistant for Growing Games from a Single Prompt](https://arxiv.org/abs/2410.01791) — *CHI 2025*.
- [What's the Game, then? Opportunities and Challenges for Runtime Behavior Generation](https://doi.org/10.1145/3654777.3676358) — *UIST 2024*.
- [Game Generation via Large Language Models](https://arxiv.org/abs/2404.08706) — *IEEE CoG 2024*.

### 2023

- [SceneCraft: Automating Interactive Narrative Scene Generation in Digital Games with Large Language Models](https://doi.org/10.1609/aiide.v19i1.27504) — *AIIDE 2023*.
- [CALYPSO: LLMs as Dungeon Masters' Assistants](https://arxiv.org/abs/2308.07540) — *AIIDE 2023*.
- ⭐ [MarioGPT: Open-Ended Text2Level Generation through Large Language Models](https://arxiv.org/abs/2302.05981) — *NeurIPS 2023*.

### 2022

- ⭐ [Puck: A Slow and Personal Automated Game Designer](https://ojs.aaai.org/index.php/AIIDE/article/view/21968) — *AIIDE*.
- [On Mixed-Initiative Content Creation for Video Games](https://doi.org/10.1109/TG.2022.3176215) — *IEEE Transactions on Games*.

### 2020

- [Deep Learning for Procedural Content Generation](https://arxiv.org/abs/2010.04548) — *Neural Computing and Applications*.
- ⭐ [PCGRL: Procedural Content Generation via Reinforcement Learning](https://doi.org/10.1609/aiide.v16i1.7416) — *AIIDE 2020*.

### 2018

- ⭐ [Automated Game Design via Conceptual Expansion](https://arxiv.org/abs/1809.02232) — *AIIDE 2018*.
- ⭐ [Evolving Mario Levels in the Latent Space of a Deep Convolutional Generative Adversarial Network](https://arxiv.org/abs/1805.00728) — *GECCO 2018*.

### 2017

- [Procedural Content Generation via Machine Learning](https://arxiv.org/abs/1702.00539) — *IEEE Transactions on Games*.

### 2016

- ⭐ [Super Mario as a String: Platformer Level Generation via LSTMs](https://doi.org/10.26503/dl.v2016i1.752) — *DiGRA/FDG 2016*.

### 2014

- ⭐ [Automatic Game Design via Mechanic Generation](https://doi.org/10.1609/aaai.v28i1.8788) — *AAAI 2014*.

### 2013

- ⭐ [Mechanic Miner: Reflection-Driven Game Mechanic Discovery and Level Design](https://doi.org/10.1007/978-3-642-37192-9_29) — *EvoApplications*.
- [Procedural Content Generation for Games: A Survey](https://doi.org/10.1145/2422956.2422957) — *ACM TOMM*.

### 2011

- ⭐ [Multi-Faceted Evolution of Simple Arcade Games](https://doi.org/10.1109/CIG.2011.6032019) — *IEEE CIG 2011*.
- ⭐ [Answer Set Programming for Procedural Content Generation: A Design Space Approach](https://doi.org/10.1109/TCIAIG.2011.2158545) — *IEEE TCIAIG*.
- ⭐ [Tanagra: Reactive Planning and Constraint Solving for Mixed-Initiative Level Design](https://doi.org/10.1109/TCIAIG.2011.2159716) — *IEEE TCIAIG*.
- ⭐ [Experience-Driven Procedural Content Generation](https://doi.org/10.1109/T-AFFC.2011.6) — *IEEE Transactions on Affective Computing*.
- [Search-Based Procedural Content Generation: A Taxonomy and Survey](https://doi.org/10.1109/TCIAIG.2011.2148116) — *IEEE TCIAIG*.

### 2010

- ⭐ [Evolutionary Game Design](https://doi.org/10.1109/TCIAIG.2010.2041928) — *IEEE TCIAIG*.

### 2008

- ⭐ [An Experiment in Automatic Game Design](https://doi.org/10.1109/CIG.2008.5035629) — *IEEE CIG 2008*.

### 2007

- ⭐ [Towards Automated Game Design](https://doi.org/10.1007/978-3-540-74782-6_54) — *AI*IA 2007*.

### 2006

- ⭐ [Procedural Level Design for Platform Games](https://doi.org/10.1609/aiide.v2i1.18755) — *AIIDE 2006*.

## Game Development and Maintenance

> Code, scenes, engine projects, tool-using development agents, debugging, repair, and revision.

### 2026

- ⭐ [Agentic Game Development as a Verifiable Trajectory Data Engine for Scaling World Models](https://arxiv.org/abs/2608.25518) — *arXiv*.
- ⭐ [GameXpert-Bench: How Far Are Coding Agents from Expert Game Development?](https://arxiv.org/abs/2608.21833) — *arXiv*.
- ⭐ [JAMER: Project-Level Code Framework Dataset and Benchmark on Professional Game Engines](https://arxiv.org/abs/2606.19830) — *arXiv*.
- [OpenGame: Open Agentic Coding for Games](https://arxiv.org/abs/2604.18394) — *arXiv*.
- ⭐ [PlayCoder: Making LLM-Generated GUI Code Playable](https://arxiv.org/abs/2604.19742) — *arXiv*.
- [AutoUE: Automated Generation of 3D Games in Unreal Engine via Multi-Agent Systems](https://arxiv.org/abs/2603.07106) — *arXiv*.

### 2025

- [STORY2GAME: Generating (Almost) Everything in an Interactive Fiction Game](https://arxiv.org/abs/2505.03547) — *arXiv*.

## Runtime Generation and Adaptation

> Characters, dialogue, quests, narrative, personalization, and content generated during play.

### 2026

- [IF:CARGO: LLM-Based Semantic Compilation for AI-Native Rule Programming Games](https://arxiv.org/abs/2608.12195) — *arXiv*.
- [Proact-VL: A Proactive VideoLLM for Real-Time AI Companions](https://arxiv.org/abs/2603.03447) — *arXiv*.

### 2025

- [Real-Time World Crafting: Generating Structured Game Behaviors from Natural Language with Large Language Models](https://arxiv.org/abs/2510.16952) — *Wordplay @ EMNLP 2025*.

### 2024

- [A Survey on Large Language Model-Based Social Agents in Game-Theoretic Scenarios](https://arxiv.org/abs/2412.03920) — *arXiv*.
- [PANGeA: Procedural Artificial Narrative Using Generative AI for Turn-Based, Role-Playing Video Games](https://doi.org/10.1609/aiide.v20i1.31876) — *AIIDE 2024*.
- ⭐ [Unbounded: A Generative Infinite Game of Character Life Simulation](https://arxiv.org/abs/2410.18975) — *ICLR 2025*.

### 2023

- [Language as Reality: A Co-Creative Storytelling Game Experience in 1001 Nights using Generative AI](https://arxiv.org/abs/2308.12915) — *AIIDE 2023*.

### 2014

- ⭐ [Personalized Interactive Narratives via Sequential Recommendation of Plot Points](https://doi.org/10.1109/TCIAIG.2013.2282771) — *IEEE TCIAIG*.

### 2013

- [Interactive Narrative: An Intelligent Systems Approach](https://doi.org/10.1609/aimag.v34i1.2449) — *AI Magazine*.

### 2010

- ⭐ [Narrative Planning: Balancing Plot and Character](https://doi.org/10.1613/jair.2989) — *Journal of Artificial Intelligence Research*.

### 2008

- [A Survey and Qualitative Analysis of Recent Advances in Drama Management](https://faculty.cc.gatech.edu/~isbell/papers/itssa08-survey.pdf) — *International Transactions on Systems Science and Applications*.

### 2005

- ⭐ [Structuring Content in the Façade Interactive Drama Architecture](https://doi.org/10.1609/aiide.v1i1.18722) — *AIIDE 2005*.

## Game Testing and Evaluation

> Automated playtesting, verification, benchmarks, model judges, coverage, and player evidence.

### 2026

- [PlayWorld: Benchmarking World Models with Agent Players over Long-Horizon Objectives](https://arxiv.org/abs/2608.13552) — *arXiv*.
- [GameEngineBench: Evaluating Coding Agents on Real C++ Runtime Environments](https://arxiv.org/abs/2607.03525) — *arXiv*.
- [GameCraft-Bench: Can Agents Build Playable Games End-to-End in a Real Game Engine?](https://arxiv.org/abs/2606.17861) — *arXiv / listed venue*.
- ⭐ [WorldOlympiad: Can Your World Model Survive a Triathlon?](https://arxiv.org/abs/2606.11129) — *arXiv*.
- ⭐ [CA2: Code-Aware Agent for Automated Game Testing](https://arxiv.org/abs/2605.13918) — *arXiv*.
- [GameGen-Verifier: Parallel Keypoint-Based Verification for LLM-Generated Games via Runtime State Injection](https://arxiv.org/abs/2605.07442) — *arXiv*.
- [Mage: Multi-Axis Evaluation of LLM-Generated Executable Game Scenes Beyond Compile-Pass Rate](https://arxiv.org/abs/2605.07342) — *arXiv*.
- [WebGameBench: Requirement-to-Application Evaluation for Coding Agents via Browser-Native Games](https://arxiv.org/abs/2605.17637) — *arXiv*.
- [GameWorld: Towards Standardized and Verifiable Evaluation of Multimodal Game Agents](https://arxiv.org/abs/2604.07429v1) — *arXiv*.
- [PokeGym: A Visually-Driven Long-Horizon Benchmark for Vision-Language Models](https://arxiv.org/abs/2604.08340) — *arXiv*.
- [The Double-Edged Sword of Open-Ended Interaction: How LLM-Driven NPCs Affect Players' Cognitive Load and Gaming Experience](https://arxiv.org/abs/2604.10107) — *arXiv*.
- [Beyond Scaling: Assessing Strategic Reasoning and Rapid Decision-Making Capability of LLMs in Zero-sum Environments](https://arxiv.org/abs/2603.09337) — *arXiv*.
- [GameplayQA: A Benchmarking Framework for Decision-Dense POV-Synced Multi-Video Understanding of 3D Virtual Agents](https://arxiv.org/abs/2603.24329) — *ACL 2026*.
- [GTO Wizard Benchmark](https://arxiv.org/abs/2603.23660) — *arXiv*.
- [AI Gamestore: Scalable, Open-Ended Evaluation of Machine General Intelligence with Human Games](https://arxiv.org/abs/2602.17594) — *arXiv*.
- [GameDevBench: Evaluating Agentic Capabilities Through Game Development](https://arxiv.org/abs/2602.11103) — *arXiv*.
- [OpenGuanDan: A Large-Scale Imperfect Information Game Benchmark](https://arxiv.org/abs/2602.00676) — *arXiv*.
- [EMemBench: Interactive Benchmarking of Episodic Memory for VLM Agents](https://arxiv.org/abs/2601.16690) — *arXiv*.
- [LLMs as Rules Oracles: Exploring Real-World Multimodal Reasoning in Tabletop Strategy Game Environments](https://openreview.net/forum?id=TOgQ00DEek) — *ICLR 2026*.
- [MineNPC-Task: Task Suite for Memory-Aware Minecraft Agents](https://arxiv.org/abs/2601.05215) — *arXiv*.
- [Multicultural Spyfall: Assessing LLMs through Dynamic Multilingual Social Deduction Game](https://arxiv.org/abs/2601.09017) — *arXiv*.
- [Sparks of Cooperative Reasoning: LLMs as Strategic Hanabi Agents](https://arxiv.org/abs/2601.18077) — *arXiv*.
- [TowerMind: A Tower Defence Game Learning Environment and Benchmark for LLM as Agents](https://ojs.aaai.org/index.php/AAAI/article/view/39818) — *AAAI 2026*.

### 2025

- [LLM CHESS: Benchmarking Reasoning and Instruction-Following in LLMs through Chess](https://arxiv.org/abs/2512.01992) — *arXiv*.
- [WOLF: Werewolf-based Observations for LLM Deception and Falsehoods](https://arxiv.org/abs/2512.09187) — *arXiv*.
- ⭐ [SAGE: Semantic-Aware Gray-Box Game Regression Testing with Large Language Models](https://arxiv.org/abs/2512.00560) — *arXiv*.
- [Beyond Survival: Evaluating LLMs in Social Deduction Games with Human-Aligned Strategies](https://arxiv.org/abs/2510.11389) — *arXiv*.
- [CATArena: Evaluation of LLM Agents through Iterative Tournament Competitions](https://arxiv.org/abs/2510.26852v1) — *arXiv*.
- [LLM-Hanabi: Evaluating Multi-Agent Gameplays with Theory-of-Mind and Rationale Inference in Imperfect Information Collaboration Game](https://arxiv.org/abs/2510.04980) — *EMNLP 2025 workshop*.
- [Mixing Expert Knowledge: Bring Human Thoughts Back To the Game of Go](https://neurips.cc/virtual/2025/loc/san-diego/poster/117166) — *NeurIPS 2025*.
- [PuzzlePlex: Benchmarking Foundation Models on Reasoning and Planning with Puzzles](https://arxiv.org/abs/2510.06475v1) — *arXiv*.
- [StarBench: A Turn-Based RPG Benchmark for Agentic Multimodal Decision-Making and Information Seeking](https://arxiv.org/abs/2510.18483) — *arXiv*.
- [Symbolically Scaffolded Play: Designing Role-Sensitive Prompts for Generative NPC Dialogue](https://arxiv.org/abs/2510.25820) — *arXiv*.
- [Can Large Language Models Master Complex Card Games?](https://openreview.net/forum?id=cmN8Wbvanr) — *NeurIPS 2025*.
- [EvoEmpirBench: Dynamic Spatial Reasoning with Agent-ExpVer](https://ojs.aaai.org/index.php/AAAI/article/view/40979) — *AAAI 2026*.
- [Leveraging LLM Agents for Automated Video Game Testing](https://arxiv.org/abs/2509.22170) — *arXiv*.
- [PillagerBench: Benchmarking LLM-Based Agents in Competitive Minecraft Team Environments](https://ieeexplore.ieee.org/document/11114387) — *CoG 2025*.
- ⭐ [FAIRGAMER: Evaluating Biases in the Application of Large Language Models to Video Games](https://arxiv.org/abs/2508.17825) — *arXiv*.
- [Game Reasoning Arena: A Framework and Benchmark for Assessing Reasoning Capabilities of Large Language Models via Game Play](https://arxiv.org/abs/2508.03368) — *arXiv*.
- [GVGAI-LLM: Evaluating Large Language Model Agents with Infinite Games](https://arxiv.org/abs/2508.08501) — *arXiv*.
- [PuzzleJAX: A Benchmark for Reasoning and Learning](https://arxiv.org/abs/2508.16821v1) — *arXiv*.
- [Who is a Better Player: LLM against LLM](https://arxiv.org/abs/2508.04720v1) — *arXiv*.
- [Assessing Adaptive World Models in Machines with Novel Games](https://arxiv.org/abs/2507.12821) — *arXiv*.
- [MazeEval: A Benchmark for Testing Sequential Decision-Making in Language Models](https://arxiv.org/abs/2507.20395) — *arXiv*.
- [StarDojo: Benchmarking Open-Ended Behaviors of Agentic Multimodal LLMs in Production-Living Simulations with Stardew Valley](https://arxiv.org/abs/2507.07445) — *arXiv*.
- [TextQuests: How Good are LLMs at Text-Based Video Games?](https://arxiv.org/abs/2507.23701) — *arXiv*.
- [Orak: A Foundational Benchmark for Training and Evaluating LLM Agents on Diverse Video Games](https://arxiv.org/abs/2506.03610) — *ICLR 2026*.
- [TextAtari: 100K Frames Game Playing with Language Agents](https://arxiv.org/abs/2506.04098) — *arXiv*.
- [Zero-Shot Reasoning: Personalized Content Generation Without the Cold Start Problem](https://arxiv.org/abs/2402.10133) — *IEEE Transactions on Games*.
- [Is Your LLM Really Mastering the Concept? A Multi-Agent Benchmark](https://arxiv.org/abs/2505.17512v2) — *arXiv*.
- [KORGym: A Dynamic Game Platform for LLM Reasoning Evaluation](https://openreview.net/forum?id=uAeqQePu4c) — *NeurIPS 2025*.
- [MCU: An Evaluation Framework for Open-Ended Game Agents](https://proceedings.mlr.press/v267/zheng25j.html) — *ICML 2025*.
- [TextArena](https://arxiv.org/abs/2504.11442) — *arXiv*.
- [V-MAGE: A Game Evaluation Framework for Assessing Vision-Centric Capabilities in Multimodal Large Language Models](https://arxiv.org/abs/2504.06148) — *ACL 2026*.
- [Are Large Vision Language Models Good Game Players?](https://proceedings.iclr.cc/paper_files/paper/2025/hash/27881a19f100fdbf57f0ba1c3d499b08-Abstract-Conference.html) — *ICLR 2025*.
- [AVA: Attentive VLM Agent for Mastering StarCraft II](https://arxiv.org/abs/2503.05383) — *arXiv*.
- [Collab-Overcooked: Benchmarking and Evaluating Large Language Models as Collaborative Agents](https://aclanthology.org/2025.emnlp-main.249/) — *EMNLP 2025*.
- [Complete Chess Games Enable LLM Become A Chess Master](https://aclanthology.org/2025.naacl-short.1/) — *NAACL 2025*.
- [PokerBench: Training Large Language Models to Become Professional Poker Players](https://ojs.aaai.org/index.php/AAAI/article/view/34814) — *AAAI 2025*.

### 2024

- [GameArena: Evaluating LLM Reasoning through Live Computer Games](https://proceedings.iclr.cc/paper_files/paper/2025/hash/520416e27d3b0cef3cd70a083e2991c7-Abstract-Conference.html) — *ICLR 2025*.
- [TeamCraft: A Benchmark for Multi-Modal Multi-Agent Systems in Minecraft](https://arxiv.org/abs/2412.05255v1) — *arXiv*.
- [BALROG: Benchmarking Agentic LLM and VLM Reasoning On Games](https://openreview.net/forum?id=fp6t3F669F) — *ICLR 2025*.
- [GameTraversalBenchmark: Evaluating Planning Abilities Of Large Language Models Through Traversing 2D Game Maps](https://papers.nips.cc/paper_files/paper/2024/hash/3852c8254bc6d904c09db9921157f59b-Abstract-Datasets_and_Benchmarks_Track.html) — *NeurIPS 2024*.
- [ING-VP: MLLMs cannot Play Easy Vision-based Games Yet](https://arxiv.org/abs/2410.06555) — *arXiv*.
- [TMGBench: A Systematic Game Benchmark for Evaluating Strategic Reasoning Abilities of LLMs](https://arxiv.org/abs/2410.10479) — *arXiv*.
- [Mars: Situated Inductive Reasoning in an Open-World Environment](https://neurips.cc/virtual/2024/poster/97857) — *NeurIPS 2024 (D&amp;B)*.
- [StarCraft II Arena: Evaluating LLMs in Strategic Planning, Real-Time Decision Making, and Adaptability](https://openreview.net/forum?id=o3V7OuPxu4) — *arXiv*.
- [Atari-GPT: Benchmarking Multimodal Large Language Models as Low-Level Policies in Atari Games](https://arxiv.org/abs/2408.15950) — *arXiv*.
- [Collaborative Quest Completion with LLM-Driven Non-Player Characters in Minecraft](https://arxiv.org/abs/2407.03460) — *Wordplay @ ACL 2024*.
- [Evaluating Large Language Models with Grid-Based Game Competitions: An Extensible LLM Benchmark and Leaderboard](https://arxiv.org/abs/2407.07796) — *Journal of Cognitive Systems 2025*.
- [Werewolf Arena: A Case Study in LLM Evaluation via Social Deduction](https://arxiv.org/abs/2407.13943) — *arXiv*.
- [GameBench: Evaluating Strategic Reasoning Abilities of LLM Agents](https://arxiv.org/abs/2406.06613) — *arXiv*.
- [clembench-2024: A Challenging, Dynamic, Complementary, Multilingual Benchmark and Underlying Flexible Framework for LLMs as Multi-Action Agents](https://arxiv.org/abs/2405.20859) — *arXiv*.
- [Player-Driven Emergence in LLM-Driven Game Narrative](https://arxiv.org/abs/2404.17027) — *IEEE CoG 2024*.
- [How Far Are We on the Decision-Making of LLMs? Evaluating LLMs' Gaming Ability in Multi-Agent Environments](https://arxiv.org/abs/2403.11807) — *ICLR 2025*.
- [GTBench: Uncovering the Strategic Reasoning Limitations of LLMs via Game-Theoretic Evaluations](https://proceedings.neurips.cc/paper_files/paper/2024/hash/3191170938b6102e5c203b036b7c16dd-Abstract-Conference.html) — *NeurIPS 2024*.
- [CivRealm: A Learning and Reasoning Odyssey in Civilization for Decision-Making Agents](https://openreview.net/forum?id=UBVNwD3hPN) — *ICLR 2024*.

### 2023

- [AvalonBench: Evaluating LLMs Playing the Game of Avalon](https://arxiv.org/abs/2310.05036) — *arXiv*.
- [LLM-Coordination: Evaluating and Analyzing Multi-agent Coordination Abilities in Large Language Models](https://aclanthology.org/2025.findings-naacl.448/) — *Findings of NAACL 2025*.
- [SmartPlay : A Benchmark for LLMs as Intelligent Agents](https://openreview.net/forum?id=S2oTVrlcp3) — *ICLR 2024*.
- [clembench: Using Game Play to Evaluate Chat-Optimized Language Models as Conversational Agents](https://aclanthology.org/2023.emnlp-main.689/) — *EMNLP 2023*.

### 2022

- [Human-level play in the game of Diplomacy by combining language models with strategic reasoning](https://doi.org/10.1126/science.ade9097) — *Science 2022*.
- [Retrospective on the 2021 MineRL BASALT Competition on Learning from Human Feedback](https://proceedings.mlr.press/v176/shah22a.html) — *NeurIPS Competition Track*.

### 2021

- [Benchmarking the Spectrum of Agent Capabilities](https://openreview.net/forum?id=1W0z96MFEoH) — *ICLR 2022*.
- [Scalable Evaluation of Multi-Agent Reinforcement Learning with Melting Pot](https://arxiv.org/abs/2107.06857) — *ICML 2021*.
- ⭐ [Automated Video Game Testing Using Synthetic and Humanlike Agents](https://arxiv.org/abs/1906.00317) — *IEEE Transactions on Games*.

### 2020

- [The NetHack Learning Environment](https://proceedings.neurips.cc/paper/2020/hash/569ff987c643b4bedf504efda8f786c2-Abstract.html) — *NeurIPS 2020*.
- [The Hanabi Challenge: A New Frontier for AI Research](https://arxiv.org/abs/1902.00506) — *Artificial Intelligence*.

### 2019

- [The StarCraft Multi-Agent Challenge](https://arxiv.org/abs/1902.04043) — *AAMAS 2019*.
- [Interactive Fiction Games: A Colossal Adventure](https://arxiv.org/abs/1909.05398) — *AAAI 2020*.
- [OpenSpiel: A Framework for Reinforcement Learning in Games](https://arxiv.org/abs/1908.09453) — *arXiv*.
- [The MineRL 2019 Competition on Sample Efficient Reinforcement Learning Using Human Priors](https://arxiv.org/abs/1904.10079) — *NeurIPS 2019 Competition*.

### 2018

- [TextWorld: A Learning Environment for Text-Based Games](https://arxiv.org/abs/1806.11532) — *CoRR*.
- ⭐ [Automated Playtesting with Procedural Personas through MCTS with Evolved Heuristics](https://arxiv.org/abs/1802.06881) — *IEEE Transactions on Games*.

## Contributing

Suggestions are welcome through [issues](https://github.com/Eurekaleo/awesome-ai-for-games/issues/new/choose) or pull requests. Please provide the canonical paper URL, publication year, and the best matching collection. Keep descriptions factual and concise.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the submission format.

## License

The repository structure and presentation are available under the [MIT License](LICENSE). Linked papers, datasets, models, games, and project assets retain their original licenses and copyrights.
