import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { GraphicComponent } from "./components/graphic/graphic.component";
import { ForceComponent } from "./components/force/force.component";

const routes: Routes = [
  {
    path: "",
    component: GraphicComponent,
    pathMatch: "full"
  },
  {
    path: "force",
    component: ForceComponent,
    pathMatch: "full"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
