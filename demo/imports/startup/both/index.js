import { Log } from 'meteor/mozfet:meteor-logs'

Log.color('error', 'white', 'red')
Log.color('warning', 'white', 'orange')
Log.color('information', 'black', 'green')
Log.color('debug', 'black', 'yellow')

Log.color('payments', 'orange')
Log.color('braintree', 'green')
Log.color('subscriptions', 'purple')
Log.color('events', 'red')
Log.color('buyButton', 'pink')

Log.messageIndent(35)
Log.standardStreams(false)
