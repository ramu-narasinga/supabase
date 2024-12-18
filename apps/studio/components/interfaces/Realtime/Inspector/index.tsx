import { useParams } from 'common'
import { useState } from 'react'

import { useSendEventMutation } from 'data/telemetry/send-event-mutation'
import { TelemetryActions } from 'lib/constants/telemetry'
import { Header } from './Header'
import MessagesTable from './MessagesTable'
import { SendMessageModal } from './SendMessageModal'
import { RealtimeConfig, useRealtimeMessages } from './useRealtimeMessages'

/**
 * Acts as a container component for the entire log display
 */
export const RealtimeInspector = () => {
  const { ref } = useParams()
  const [sendMessageShown, setSendMessageShown] = useState(false)

  const [realtimeConfig, setRealtimeConfig] = useState<RealtimeConfig>({
    enabled: false,
    projectRef: ref!,
    channelName: '',
    logLevel: 'info',
    token: '', // will be filled out by RealtimeTokensPopover
    schema: 'public',
    table: '*',
    isChannelPrivate: false,
    filter: undefined,
    bearer: null,
    enablePresence: true,
    enableDbChanges: true,
    enableBroadcast: true,
  })

  const { mutate: sendEvent } = useSendEventMutation()
  const { logData, sendMessage } = useRealtimeMessages(realtimeConfig, setRealtimeConfig)

  return (
    <div className="flex flex-col grow h-full">
      <Header config={realtimeConfig} onChangeConfig={setRealtimeConfig} />
      <div className="relative flex flex-col grow">
        <div className="flex grow">
          <MessagesTable
            hasChannelSet={realtimeConfig.channelName.length > 0}
            enabled={realtimeConfig.enabled}
            data={logData}
            showSendMessage={() => setSendMessageShown(true)}
          />
        </div>
      </div>
      <SendMessageModal
        visible={sendMessageShown}
        onSelectCancel={() => setSendMessageShown(false)}
        onSelectConfirm={(v) => {
          sendEvent({ action: TelemetryActions.REALTIME_INSPECTOR_BROADCAST_SENT })
          sendMessage(v.message, v.payload, () => setSendMessageShown(false))
        }}
      />
    </div>
  )
}
