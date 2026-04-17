$filePath = "c:\Users\joaov\OneDrive\Área de Trabalho\Codigo app\aplicativo-slimday\aplicativo-slimday\src\components\SlimDayApp.tsx"
$lines = Get-Content $filePath

$newImports = @"
import { 
  Plus, Trash2, Save, Utensils, Dumbbell, User, CheckCircle2, Circle, Menu, X, ArrowRight, ArrowLeft, Target, Calendar as CalendarIcon, Layout, Bell, Share2, ChevronRight, AlertCircle, Info, HelpCircle, MessageSquare, Heart, Zap, TrendingUp, Award, Clock, Star, Moon, Droplets, Coffee, Apple, Camera, Youtube, PlusCircle, ArrowUpRight, Check, ShieldCheck, Sparkles, History, Flame, ExternalLink, ChevronDown, Play, ClipboardList, ChevronLeft, Settings, LogOut, Send, Lock, Eye, BookOpen, Clock3, Salad, ChevronUp, Trophy, BadgeCheck, CalendarDays, Waves, Sun, BarChart3, PlayCircle, RefreshCcw, Cloud, CloudOff, ShoppingCart, MessageCircle, Video, Home, BellOff, MapPin
} from "lucide-react";
import { recipeImages } from "@/assets/recipes";
import { 
  FitnessLevel, Goal, TimePerDay, MealStyle, RoutineStyle, SyncStatus, CyclePhase, 
  Profile, PlanItem, DayPlan, DailyMessage, NotificationItem, AuthUser, CycleDay, 
  PersistedState, OnboardingStep, RecipeDetail, PlanItemWithRecipe 
} from "@/data/types";
import { recipeBank, mealBase, phaseTreats } from "@/data/recipes";
import { exerciseMeta, tutorialMap, categoryColors, dailyMessages } from "@/data/exercises";
"@

# Line 1 to 4: Maintain initial comments
# Line 5 to approx 130: Keep existing imports and helpers
# Line 133 to 221: REMOVE (Types)
# Line 353 to 788: REMOVE (DataBank)

$result = @()
$skipTypes = $false
$skipData = $false

foreach ($i in 0..($lines.Count - 1)) {
    $line = $lines[$i]
    $lineNum = $i + 1

    # Remove the old imports block (logic is simplified for speed)
    if ($lineNum -ge 10 -and $lineNum -le 80 -and ($line -match "import {" -or $line -match "  \w+,")) {
        if ($lineNum -eq 10) { $result += $newImports }
        continue
    }

    # Skip Types block
    if ($lineNum -eq 133) { $skipTypes = $true }
    if ($skipTypes) {
        if ($lineNum -eq 221) { $skipTypes = $false }
        continue
    }

    # Skip Data block
    if ($lineNum -eq 353) { $skipData = $true }
    if ($skipData) {
        if ($lineNum -eq 788) { $skipData = $false }
        continue
    }

    $result += $line
}

$result | Out-File -FilePath $filePath -Encoding UTF8
