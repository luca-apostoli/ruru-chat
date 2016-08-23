defmodule Ruru.Presence do
  use Phoenix.Presence, otp_app: :ruru, pubsub_server: Ruru.PubSub
end