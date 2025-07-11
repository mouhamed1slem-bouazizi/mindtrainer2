"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Bell, Moon, Volume2, Share2, Download, Trash2 } from "lucide-react"
import { ProfileInfo } from "./profile-info"

export function ProfileSettings() {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [soundEffects, setSoundEffects] = useState(true)
  const [difficulty, setDifficulty] = useState([70])
  const [dailyGoal, setDailyGoal] = useState([10])

  return (
    <div className="space-y-4 pb-20">
      <h2 className="text-xl font-bold">Settings</h2>

      {/* Profile Card */}
      <ProfileInfo showDetailedStats={true} />

      {/* Training Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Training Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Adaptive Difficulty</p>
                <p className="text-sm text-gray-500">Target success rate: {difficulty[0]}%</p>
              </div>
            </div>
            <Slider value={difficulty} onValueChange={setDifficulty} max={90} min={50} step={5} className="w-full" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Goal</p>
                <p className="text-sm text-gray-500">{dailyGoal[0]} minutes per day</p>
              </div>
            </div>
            <Slider value={dailyGoal} onValueChange={setDailyGoal} max={30} min={5} step={5} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">App Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">Training Reminders</p>
                <p className="text-sm text-gray-500">Daily notifications at 9:00 AM</p>
              </div>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-gray-500">Easier on the eyes</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">Sound Effects</p>
                <p className="text-sm text-gray-500">Audio feedback during games</p>
              </div>
            </div>
            <Switch checked={soundEffects} onCheckedChange={setSoundEffects} />
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Share2 className="w-4 h-4 mr-2" />
            Share Progress Card
          </Button>

          <Button variant="outline" className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Export Training Data
          </Button>

          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All Data
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About MindTrainer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>Version 1.0.0</p>
          <p>Built with scientific research on cognitive training</p>
          <p>© 2024 MindTrainer. All rights reserved.</p>

          <div className="pt-4 space-y-2">
            <Button variant="link" className="p-0 h-auto text-sm">
              Privacy Policy
            </Button>
            <Button variant="link" className="p-0 h-auto text-sm">
              Terms of Service
            </Button>
            <Button variant="link" className="p-0 h-auto text-sm">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
