import { Question } from "../InterviewSubjects";

// Collection of Cloud and DevOps interview questions
export const cloudDevOpsQuestions: Question[] = [
  {
    id: "cloud-1",
    question:
      "Explain the concept of Infrastructure as Code (IaC) and its benefits.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "Infrastructure as Code (IaC) is a practice where infrastructure resources are defined and managed using code and software development techniques rather than manual processes or GUI-based tools. Popular IaC tools include Terraform, AWS CloudFormation, Azure Resource Manager templates, and Pulumi. The core benefits include: 1) Consistency and repeatability - infrastructure is deployed the same way every time, eliminating configuration drift and environment inconsistencies; 2) Version control - infrastructure definitions can be versioned in Git repositories, providing history, rollback capabilities, and collaborative workflows; 3) Automation and efficiency - deployment processes can be automated, reducing human error and freeing up teams for higher-value work; 4) Documentation - the code itself serves as documentation of the infrastructure; 5) Testing capabilities - infrastructure definitions can be validated before deployment; 6) Scalability - quickly replicate environments or components; and 7) Disaster recovery - rapidly rebuild environments from code when needed. IaC enables DevOps practices by bridging development and operations, allowing infrastructure to follow similar workflows as application code with code reviews, testing, and CI/CD pipelines. When implementing IaC, best practices include using modules for reusability, minimizing hard-coded values in favor of variables and parameters, implementing state management (especially with Terraform), and ensuring secrets are handled securely.",
    tips: [
      "Compare declarative vs imperative approaches",
      "Discuss specific tools like Terraform, CloudFormation",
      "Explain state management challenges",
      "Address security considerations in IaC",
    ],
    tags: ["cloud", "devops", "infrastructure", "automation"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "cloud-2",
    question:
      "Compare and contrast containerization (Docker) with virtualization.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "Containerization and virtualization are both approaches to resource isolation and application packaging, but they differ significantly in architecture and resource utilization. Virtualization uses hypervisors to create multiple virtual machines (VMs), each with its own operating system and kernel running on virtualized hardware. This provides strong isolation but results in larger resource overhead. Examples include VMware, Hyper-V, and VirtualBox. Containerization, exemplified by Docker, operates at the OS level where containers share the host OS kernel but run in isolated user spaces with their own filesystem, processes, and network interfaces. Containers are more lightweight (MBs vs. GBs for VMs), start almost instantly (seconds vs. minutes), and allow higher density on the same hardware. However, they offer less isolation than VMs and are limited to running on compatible host OS kernels (Linux containers on Linux hosts, though Windows containers now exist for Windows workloads). In terms of security, VMs provide stronger isolation due to their complete separation at the hypervisor level, while containers have a larger attack surface with the shared kernel. For portability, containers excel with their 'build once, run anywhere' approach, but they still require compatible host systems. Many organizations adopt a hybrid approach: using containers for applications and microservices while running them on virtual machines for additional isolation, especially in cloud environments. Container orchestration tools like Kubernetes help manage these containerized workloads at scale.",
    tips: [
      "Discuss resource efficiency differences",
      "Explain isolation levels and security implications",
      "Address orchestration considerations",
      "Mention real-world use cases for each",
    ],
    tags: ["cloud", "devops", "containers", "virtualization", "docker"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "cloud-3",
    question:
      "What is Kubernetes and how does it solve container orchestration challenges?",
    category: "technical",
    difficulty: "hard",
    type: "technical",
    sampleAnswer:
      "Kubernetes is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications. Originally developed by Google and now maintained by the Cloud Native Computing Foundation, it addresses several container orchestration challenges. First, for deployment and scheduling, Kubernetes places containers on nodes based on resource requirements and constraints, using the concept of Pods (co-located groups of containers) as the smallest deployable unit. It handles service discovery and load balancing through Services, which provide a stable endpoint for accessing pods, and Ingress resources for HTTP(S) routing. For scaling, Kubernetes offers both horizontal pod autoscaling based on metrics like CPU/memory and cluster autoscaling to adjust underlying infrastructure. It ensures high availability through ReplicaSets maintaining desired replica counts, self-healing by automatically replacing failed containers, and rolling updates for zero-downtime deployments. Storage orchestration is managed via PersistentVolumes and PersistentVolumeClaims, abstracting the underlying storage. For configuration management, Kubernetes uses ConfigMaps for non-sensitive configuration and Secrets for sensitive data. Its architecture consists of a control plane (API server, scheduler, controller manager, etcd) and worker nodes running the kubelet, container runtime, and kube-proxy. While powerful, Kubernetes has a steep learning curve, requires careful security configuration, and introduces operational complexity that may be excessive for simple applications.",
    tips: [
      "Explain key Kubernetes components",
      "Discuss the role of operators and CRDs",
      "Address networking models in Kubernetes",
      "Compare with alternatives like Docker Swarm",
    ],
    tags: ["cloud", "devops", "kubernetes", "containers", "orchestration"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "cloud-4",
    question:
      "Explain the concept of CI/CD and how it improves software development.",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "CI/CD (Continuous Integration/Continuous Delivery or Deployment) is a set of practices that automates the software delivery process from integration to deployment. Continuous Integration involves frequently merging code changes into a shared repository, followed by automated building and testing to detect integration issues early. This practice minimizes integration problems, improves code quality through automated testing, and provides quick feedback to developers. Continuous Delivery extends CI by automating the release process, ensuring that code is always in a deployable state after passing automated tests. It typically involves deploying to staging environments automatically while keeping production deployments manual. Continuous Deployment goes further by automatically deploying every change that passes all verification stages to production without human intervention. A typical CI/CD pipeline includes: source control integration (Git), automated builds, automated testing (unit, integration, system tests), artifact generation and storage, automated deployments, and monitoring/feedback loops. Popular tools include Jenkins, GitHub Actions, GitLab CI, CircleCI, and cloud-specific solutions like AWS CodePipeline. CI/CD benefits organizations by reducing time-to-market, improving quality through automated testing, increasing deployment frequency, detecting bugs earlier when they're cheaper to fix, enabling experimentation through easy rollbacks, and aligning development and operations teams (DevOps). Common challenges include building comprehensive test suites, securing the pipeline, managing database migrations, and adapting legacy applications to CI/CD practices.",
    tips: [
      "Differentiate between Continuous Delivery and Deployment",
      "Discuss security considerations in pipelines",
      "Explain feature flags and their role",
      "Address challenges in implementing CI/CD",
    ],
    tags: ["cloud", "devops", "ci-cd", "automation", "testing"],
    estimatedTime: 4,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
  {
    id: "cloud-5",
    question:
      "What are microservices and when would you use this architecture?",
    category: "technical",
    difficulty: "medium",
    type: "technical",
    sampleAnswer:
      "Microservices architecture is an approach to software development where applications are built as a collection of small, independent services that communicate over well-defined APIs, each running in its own process and typically managed by a small team. Each microservice is focused on a specific business capability and can be developed, deployed, scaled, and maintained independently. Key characteristics include: organization around business capabilities; independent deployment with minimal coordination; decentralized data management where each service manages its own database; failure isolation; and technology diversity, allowing different services to use different technologies as needed. I would choose microservices when building complex applications that require high scalability, agility, and continuous deployment. They're particularly beneficial for large organizations with multiple development teams that need to work independently, applications requiring different scaling needs for different components, and situations demanding high availability where failure isolation is critical. However, microservices aren't appropriate for every scenario. I would avoid them for simple applications where the overhead outweighs the benefits, when teams lack experience with distributed systems, or when the organization isn't prepared for the operational complexity. The primary challenges include managing distributed transactions, handling inter-service communication, implementing distributed monitoring, and maintaining consistent testing. Organizations that successfully implement microservices typically adopt DevOps practices, use containerization and orchestration tools like Docker and Kubernetes, implement API gateways for client communication, and utilize service discovery mechanisms.",
    tips: [
      "Compare with monolithic architecture",
      "Discuss data management challenges",
      "Explain service discovery approaches",
      "Address testing strategies for microservices",
    ],
    tags: ["cloud", "architecture", "microservices", "distributed-systems"],
    estimatedTime: 5,
    industry: ["tech"],
    practiceCount: 0,
    successRate: 0,
  },
];
