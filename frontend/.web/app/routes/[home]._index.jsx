import {Box as RadixThemesBox,Button as RadixThemesButton,Container as RadixThemesContainer,Dialog as RadixThemesDialog,Flex as RadixThemesFlex,Heading as RadixThemesHeading,Text as RadixThemesText} from "@radix-ui/themes"
import {Form_root_118906dd2214e8b6a960322740e59ef7_5134575e} from "$/app_components/heatmaps_app/pages/home"
import {Fragment,useEffect} from "react"
import {jsx} from "@emotion/react"





function Component() {





  return (
    jsx(Fragment,{},jsx(RadixThemesContainer,{css:({ ["padding"] : "16px" }),size:"3"},jsx(RadixThemesBox,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",direction:"row",gap:"3"},jsx(RadixThemesHeading,{},"Heatmap"),jsx(RadixThemesButton,{},jsx(RadixThemesText,{as:"p"},"Today")),jsx(RadixThemesButton,{},jsx(RadixThemesText,{as:"p"},"Heatmaps")),jsx(RadixThemesButton,{},jsx(RadixThemesText,{as:"p"},"Friends")),jsx(RadixThemesFlex,{},))),jsx(RadixThemesDialog.Root,{},jsx(RadixThemesDialog.Trigger,{},jsx(RadixThemesButton,{color:"amber"},jsx(RadixThemesText,{as:"p"},"+ Add task"))),jsx(RadixThemesDialog.Content,{},jsx(RadixThemesDialog.Title,{},"Add New Task"),jsx(RadixThemesDialog.Description,{},"New Task"),jsx(Form_root_118906dd2214e8b6a960322740e59ef7_5134575e,{},jsx(RadixThemesFlex,{},)))),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["minHeight"] : "85vh" }),direction:"column",justify:"center",gap:"5"},jsx(RadixThemesHeading,{size:"3",weight:"light"},"Wednesday - Week 42"),jsx(RadixThemesHeading,{size:"9"},"October 21, 2026"))),jsx("title",{},"Home"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}
Component.displayName = "Component(home)";

export default Component;
