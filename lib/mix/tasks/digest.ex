defmodule Mix.Tasks.WebpackIntegration.Digest do
  use Mix.Task

  def run(args) do
    Mix.Shell.IO.cmd "./node_modules/webpack/bin/webpack.js -p"
    :ok = Mix.Tasks.Phoenix.Digest.run(args)
  end
end
