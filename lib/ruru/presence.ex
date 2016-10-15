defmodule Ruru.Presence do
  
  @moduledoc """
    Presence provider
  """

  use Phoenix.Presence, otp_app: :ruru, pubsub_server: Ruru.PubSub
end
