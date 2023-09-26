import { connect } from "@dagger.io/dagger"

// initialize Dagger client
connect(async (client) => {

  const fossaCliVersion = "v3.8.13"
  const fossaInstall = "curl " + "-H 'Cache-Control: no-cache' " +
    "https://raw.githubusercontent.com/fossas/fossa-cli/master" +
    "/install-latest.sh | bash -s -- " + fossaCliVersion
  const fossaKey = client.setSecret("fk", process.env.FOSSA_API_KEY)

  // read in current directory from host (can also pull from git)
  const source = client.host().directory(".")
  const fossa = client.container({platform: "linux/amd64"})
  .from("alpine")
  .withExec(["apk", "add", "curl", "bash"])
  .withExec(["sh", "-c", fossaInstall])
  .withWorkdir("/src")
  .withDirectory("/src", source)
  .withSecretVariable("FOSSA_API_KEY", fossaKey)
  // ensure we always execute fossa analyze
  .withEnvVariable("NO-CACHE", Date.now().toString())
  .withExec(["fossa", "analyze"])
  .stdout()

  await fossa
}, {LogOutput: process.stdout})
